const TOKEN_SAFETY_MARGIN_MS = 60 * 1000;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_ASYNC_POLL_INTERVAL_MS = 5 * 1000;
const DEFAULT_ASYNC_MAX_ATTEMPTS = 24;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJsonQuietly = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

const isSyncNotAllowedError = (status, bodyText) => {
  if (status !== 400) return false;
  const payload = parseJsonQuietly(bodyText);
  if (!payload) {
    return bodyText.includes('SYNC_EXPORT_NOT_ALLOWED');
  }
  const summary = (payload.summary || payload.message || '').toString().toUpperCase();
  const errorCode = payload?.data?.errorCode ?? payload?.errorCode;
  return summary.includes('SYNC_EXPORT_NOT_ALLOWED') || errorCode === 8133;
};

const buildAuthHeaders = async (orgId, extra = {}) => {
  const token = await getAccessToken();
  return {
    Authorization: `Zoho-oauthtoken ${token}`,
    'ZANALYTICS-ORGID': orgId,
    ...extra,
  };
};

const fetchZohoCsv = async (viewId) => {
  const orgId = requireEnv('ZOHO_ORG_ID');
  const workspace = requireEnv('ZOHO_WORKSPACE');
  const analyticsDomain = process.env.ZOHO_ANALYTICS_DOMAIN || 'analyticsapi.zoho.com';

  const config = {
    responseFormat: 'csv',
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(config));
  const baseUrl = `https://${analyticsDomain}/restapi/v2/workspaces/${encodeURIComponent(
    workspace,
  )}/views/${encodeURIComponent(viewId)}`;
  const url = `${baseUrl}/data?CONFIG=${encodedConfig}`;
  console.log('[ZohoAnalytics] export URL', { url, workspace, viewId });

  const headers = await buildAuthHeaders(orgId);

  const response = await fetch(url, { headers });

  if (response.ok) {
    return response.text();
  }

  const errorText = await response.text();
  if (isSyncNotAllowedError(response.status, errorText)) {
    return fetchZohoCsvAsync({
      orgId,
      workspace,
      viewId,
      analyticsDomain,
      config,
    });
  }

  throw new Error(`Zoho export failed (${response.status}): ${errorText}`);
};

const fetchZohoCsvAsync = async ({ orgId, workspace, viewId, analyticsDomain, config }) => {
  const baseUrl = `https://${analyticsDomain}/restapi/v2/workspaces/${encodeURIComponent(
    workspace,
  )}/views/${encodeURIComponent(viewId)}`;
  const startUrl = `${baseUrl}/export`;
  const body = new URLSearchParams({
    CONFIG: JSON.stringify(config),
  }).toString();

  const startHeaders = await buildAuthHeaders(orgId, {
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  const startResponse = await fetch(startUrl, {
    method: 'POST',
    headers: startHeaders,
    body,
  });
  const startText = await startResponse.text();
  if (!startResponse.ok) {
    throw new Error(`Zoho async export start failed (${startResponse.status}): ${startText}`);
  }

  const startPayload = parseJsonQuietly(startText);
  const jobId =
    startPayload?.data?.jobId ??
    startPayload?.data?.job_id ??
    startPayload?.jobId ??
    startPayload?.job_id;

  if (!jobId) {
    throw new Error(`Zoho async export start missing jobId: ${startText}`);
  }

  const pollInterval =
    Number(process.env.ZOHO_EXPORT_POLL_INTERVAL_MS) || DEFAULT_ASYNC_POLL_INTERVAL_MS;
  const maxAttempts =
    Number(process.env.ZOHO_EXPORT_MAX_POLL_ATTEMPTS) || DEFAULT_ASYNC_MAX_ATTEMPTS;
  const pollUrl = `${baseUrl}/export/${encodeURIComponent(jobId)}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await sleep(pollInterval);
    }

    const pollHeaders = await buildAuthHeaders(orgId);
    const pollResponse = await fetch(pollUrl, { headers: pollHeaders });
    const pollText = await pollResponse.text();
    if (!pollResponse.ok) {
      throw new Error(`Zoho async export status failed (${pollResponse.status}): ${pollText}`);
    }

    const pollPayload = parseJsonQuietly(pollText);
    const pollData = pollPayload?.data ?? pollPayload;
    const status = (pollData?.status || pollData?.state || '').toString().toUpperCase();

    if (!status || ['IN_PROGRESS', 'INPROGRESS', 'QUEUED', 'RUNNING'].includes(status)) {
      continue;
    }

    if (['COMPLETED', 'SUCCESS', 'FINISHED'].includes(status)) {
      const downloadUrl =
        pollData?.downloadUrl ||
        pollData?.download_url ||
        pollData?.fileUrl ||
        pollData?.file_url ||
        pollData?.downloadLink ||
        pollData?.result?.downloadUrl;

      if (!downloadUrl) {
        throw new Error(`Zoho async export missing download URL: ${pollText}`);
      }

      const downloadHeaders = await buildAuthHeaders(orgId);
      const fileResponse = await fetch(downloadUrl, { headers: downloadHeaders });
      const fileText = await fileResponse.text();
      if (!fileResponse.ok) {
        throw new Error(`Zoho async export download failed (${fileResponse.status}): ${fileText}`);
      }

      return fileText;
    }

    if (['FAILED', 'ERROR', 'CANCELLED'].includes(status)) {
      throw new Error(`Zoho async export failed with status ${status}: ${pollText}`);
    }
  }

  throw new Error('Zoho async export did not complete before timeout');
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

