import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'monthlySales',
  viewEnv: 'ZOHO_VIEW_MONTHLY_SALES',
  datasetLabel: "This Month's Sales",
});

