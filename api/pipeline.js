import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'pipeline',
  viewEnv: 'ZOHO_VIEW_PIPELINE',
  datasetLabel: 'Pipeline',
});

