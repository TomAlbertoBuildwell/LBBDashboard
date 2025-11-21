import { createDatasetHandler } from './_lib/zohoClient.mjs';

export default createDatasetHandler({
  cacheKey: 'enquiryByMember',
  viewEnv: 'ZOHO_VIEW_ENQUIRY_MEMBER',
  datasetLabel: 'Enquiry by Team Member',
});

