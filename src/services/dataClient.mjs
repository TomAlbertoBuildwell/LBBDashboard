import billingCsv from '../data/billing_leaderboard.csv?raw';
import enquiryByMemberCsv from '../data/enquiry_by_member.csv?raw';
import enquiriesByTeamCsv from '../data/enquiries_by_team.csv?raw';
import monthlySalesCsv from '../data/monthly_sales.csv?raw';
import outgoingEnquiriesCsv from '../data/outgoing_enquiries.csv?raw';
import pipelineCsv from '../data/pipeline.csv?raw';

const OFFLINE_NOTICE = 'Offline Mode -- Notify Admin';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const DATA_SOURCES = {
  billing: {
    label: 'Billing Leaderboard',
    envVar: 'VITE_BILLING_CSV_URL',
    storageKey: 'lbb-billing-csv',
    fallback: billingCsv,
  },
  enquiryMembers: {
    label: 'Enquiry by Team Member',
    envVar: 'VITE_ENQUIRY_MEMBER_CSV_URL',
    storageKey: 'lbb-enquiry-member-csv',
    fallback: enquiryByMemberCsv,
  },
  enquiriesTeam: {
    label: 'Enquiries by Team',
    envVar: 'VITE_ENQUIRIES_TEAM_CSV_URL',
    storageKey: 'lbb-enquiries-team-csv',
    fallback: enquiriesByTeamCsv,
  },
  monthlySales: {
    label: "This Month's Sales",
    envVar: 'VITE_MONTHLY_SALES_CSV_URL',
    storageKey: 'lbb-monthly-sales-csv',
    fallback: monthlySalesCsv,
  },
  outgoingEnquiries: {
    label: 'Outgoing Enquiries Leaderboard',
    envVar: 'VITE_OUTGOING_ENQUIRIES_CSV_URL',
    storageKey: 'lbb-outgoing-enquiries-csv',
    fallback: outgoingEnquiriesCsv,
  },
  pipeline: {
    label: 'Pipeline',
    envVar: 'VITE_PIPELINE_CSV_URL',
    storageKey: 'lbb-pipeline-csv',
    fallback: pipelineCsv,
  },
};

const isBrowser = typeof window !== 'undefined';

const readCache = (key) => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('Unable to read cached CSV', error);
    return null;
  }
};

const writeCache = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
    window.localStorage.setItem(`${key}:updatedAt`, new Date().toISOString());
  } catch (error) {
    console.warn('Unable to persist CSV cache', error);
  }
};

const shouldSkipNetwork = () => {
  if (!isBrowser) return false;
  return !navigator.onLine;
};

const fetchCsvFromNetwork = async (url, signal) => {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV (${response.status})`);
  }
  return response.text();
};

const resolveEndpoint = (envVar) => {
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  return import.meta.env[envVar];
};

const buildOfflineEntry = (label, reason) => ({
  label,
  reason,
  notice: OFFLINE_NOTICE,
});

const fetchSource = async (key, abortSignal) => {
  const source = DATA_SOURCES[key];
  const endpoint = resolveEndpoint(source.envVar);
  const offlineEntries = [];

  if (!shouldSkipNetwork() && endpoint) {
    try {
      const csvText = await fetchCsvFromNetwork(endpoint, abortSignal);
      writeCache(source.storageKey, csvText);
      return { csv: csvText, offlineEntry: null };
    } catch (error) {
      console.warn(`Network fetch failed for ${source.label}`, error);
      offlineEntries.push(buildOfflineEntry(source.label, 'Network failure'));
    }
  } else if (!endpoint) {
    offlineEntries.push(buildOfflineEntry(source.label, 'Missing endpoint configuration'));
  } else {
    offlineEntries.push(buildOfflineEntry(source.label, 'Navigator offline'));
  }

  const cachedCsv = readCache(source.storageKey);
  if (cachedCsv) {
    return { csv: cachedCsv, offlineEntry: offlineEntries[offlineEntries.length - 1] };
  }

  return { csv: source.fallback, offlineEntry: offlineEntries[offlineEntries.length - 1] };
};

export const fetchAllCsvData = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIFTEEN_MINUTES);

  try {
    const entries = await Promise.all(
      Object.keys(DATA_SOURCES).map(async (key) => {
        const { csv, offlineEntry } = await fetchSource(key, controller.signal);
        return { key, csv, offlineEntry };
      }),
    );

    const datasets = {};
    const offlineSources = [];

    entries.forEach(({ key, csv, offlineEntry }) => {
      datasets[key] = csv;
      if (offlineEntry) {
        offlineSources.push(offlineEntry);
      }
    });

    return { datasets, offlineSources };
  } finally {
    clearTimeout(timeout);
  }
};

export { OFFLINE_NOTICE };

