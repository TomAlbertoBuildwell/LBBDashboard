import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'billing',
  viewEnv: 'ZOHO_VIEW_BILLING',
  datasetLabel: 'Billing Leaderboard',
});

