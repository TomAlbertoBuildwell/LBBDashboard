import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'enquiriesByTeam',
  viewEnv: 'ZOHO_VIEW_ENQUIRIES_TEAM',
  datasetLabel: 'Enquiries by Team',
});

