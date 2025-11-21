import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllCsvData, OFFLINE_NOTICE } from '../services/dataClient.mjs';
import {
  transformBillingLeaderboard,
  transformEnquiryByTeamMember,
  transformEnquiriesByTeam,
  transformMonthlySales,
  transformOutgoingEnquiries,
  transformPipelineData,
} from '../utils/dashboardUtils.mjs';

const REFRESH_INTERVAL = 15 * 60 * 1000;

const initialState = {
  data: null,
  loading: true,
  error: null,
  offlineSources: [],
  offlineNotice: null,
  lastUpdated: null,
};

const useDashboardData = () => {
  const [state, setState] = useState(initialState);
  const isMounted = useRef(true);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { datasets, offlineSources } = await fetchAllCsvData();
      if (!isMounted.current) {
        return;
      }

      const billingLeaderboard = transformBillingLeaderboard(datasets.billing);
      const enquiryByMember = transformEnquiryByTeamMember(datasets.enquiryMembers);
      const enquiriesByTeam = transformEnquiriesByTeam(datasets.enquiriesTeam);
      const monthlySales = transformMonthlySales(datasets.monthlySales);
      const outgoingEnquiries = transformOutgoingEnquiries(datasets.outgoingEnquiries);
      const pipeline = transformPipelineData(datasets.pipeline);

      setState({
        data: {
          billingLeaderboard,
          enquiryByMember,
          enquiriesByTeam,
          monthlySales,
          outgoingEnquiries,
          pipeline,
        },
        loading: false,
        error: null,
        offlineSources,
        offlineNotice: offlineSources.length ? OFFLINE_NOTICE : null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      if (!isMounted.current) return;
      setState((prev) => ({ ...prev, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    const intervalId = setInterval(loadData, REFRESH_INTERVAL);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [loadData]);

  return state;
};

export default useDashboardData;


