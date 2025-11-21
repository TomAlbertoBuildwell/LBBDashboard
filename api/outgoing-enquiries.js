import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'outgoingEnquiries',
  viewEnv: 'ZOHO_VIEW_OUTGOING_ENQUIRIES',
  datasetLabel: 'Outgoing Enquiries Leaderboard',
});

