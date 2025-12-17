const TOKEN_SAFETY_MARGIN_MS = 60 * 1000;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

const getGlobalCache = () => {
  if (!globalThis.__zohoRuntimeCache) {
    globalThis.__zohoRuntimeCache = {
      token: null,
      datasets: {},
    };
  }
  return globalThis.__zohoRuntimeCache;
};

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getTokenFromCache = () => {
  const cache = getGlobalCache();
  if (cache.token && cache.token.expiresAt > Date.now()) {
    return cache.token.value;
  }
  return null;
};

const saveTokenToCache = (value, expiresInSeconds) => {
  const cache = getGlobalCache();
  const duration = Math.max(expiresInSeconds * 1000 - TOKEN_SAFETY_MARGIN_MS, TOKEN_SAFETY_MARGIN_MS);
  cache.token = {
    value,
    expiresAt: Date.now() + duration,
  };
};

const getAccessToken = async () => {
  const cached = getTokenFromCache();
  if (cached) {
    return cached;
  }

  const clientId = requireEnv('ZOHO_CLIENT_ID');
  const clientSecret = requireEnv('ZOHO_CLIENT_SECRET');
  const refreshToken = requireEnv('ZOHO_REFRESH_TOKEN');
  const accountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN || 'accounts.zoho.com';

  const url = `https://${accountsDomain}/oauth/v2/token`;

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoho token request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new Error('Zoho token response missing access_token');
  }

  saveTokenToCache(payload.access_token, payload.expires_in ?? 3600);
  return payload.access_token;
};

const fetchZohoCsv = async (viewId) => {
  const orgId = requireEnv('ZOHO_ORG_ID');
  const workspace = requireEnv('ZOHO_WORKSPACE');
  const analyticsDomain = process.env.ZOHO_ANALYTICS_DOMAIN || 'analyticsapi.zoho.com';

  const config = JSON.stringify({
    responseFormat: 'csv',
  });

  const encodedConfig = encodeURIComponent(config);
  const baseUrl = `https://${analyticsDomain}/restapi/v2/workspaces/${encodeURIComponent(
    workspace,
  )}/views/${encodeURIComponent(viewId)}/data`;
  const url = `${baseUrl}?CONFIG=${encodedConfig}`;

  const token = await getAccessToken();

  const response = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'ZANALYTICS-ORGID': orgId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoho export failed (${response.status}): ${errorText}`);
  }

  return response.text();
};

const getDatasetFromCache = (cacheKey) => {
  const cache = getGlobalCache();
  const entry = cache.datasets[cacheKey];
  if (entry && entry.expiresAt > Date.now()) {
    return entry.value;
  }
  return null;
};

const saveDatasetToCache = (cacheKey, csvText) => {
  const cache = getGlobalCache();
  const ttl = Number(process.env.ZOHO_CACHE_TTL_MS ?? DEFAULT_CACHE_TTL_MS);
  cache.datasets[cacheKey] = {
    value: csvText,
    expiresAt: Date.now() + ttl,
  };
};

const getDatasetCsv = async (cacheKey, viewEnvVar) => {
  const cached = getDatasetFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const viewId = requireEnv(viewEnvVar);
  const csvText = await fetchZohoCsv(viewId);
  saveDatasetToCache(cacheKey, csvText);
  return csvText;
};

export const createDatasetHandler = ({ cacheKey, viewEnv, datasetLabel }) => async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const csv = await getDatasetCsv(cacheKey, viewEnv);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.status(200).send(csv);
  } catch (error) {
    console.error(`Failed to fetch ${datasetLabel ?? cacheKey} data`, error);
    res.status(500).json({ error: 'Failed to fetch Zoho data', details: error.message });
  }
};

export default createDatasetHandler;

