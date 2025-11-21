import React from 'react';
import LeaderboardTable from './components/LeaderboardTable.jsx';
import SalesBarChart from './components/SalesBarChart.jsx';
import TargetGauge from './components/TargetGauge.jsx';
import useDashboardData from './hooks/useDashboardData.js';
import { formatCurrency, formatNumber } from './utils/csvUtils.mjs';

const ZohoAnalyticsDashboard = () => {
  const { data, loading, error, offlineSources, offlineNotice, lastUpdated } = useDashboardData();

  const billingLeaderboard = data?.billingLeaderboard ?? [];
  const enquiryByMember = data?.enquiryByMember ?? [];
  const enquiriesByTeam = data?.enquiriesByTeam ?? [];
  const outgoingEnquiries = data?.outgoingEnquiries ?? [];
  const monthlySales = data?.monthlySales ?? [];
  const pipeline = data?.pipeline ?? {
    gaugeData: [],
    domain: [0, 1],
    targetAngle: 90,
    totalAmount: 0,
    targetAmount: 360000,
  };

  const isInitialLoading = loading && !data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-white mb-2">Zoho Analytics Dashboard</h1>
          <p className="text-purple-300">Team Performance Overview</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {offlineNotice && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
            <p className="font-semibold">{offlineNotice}</p>
            <p className="text-sm mt-1">
              Affected datasets:{' '}
              {offlineSources.map((source) => source.label).join(', ') || 'unknown'}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-100">
            <p className="font-semibold">Unable to refresh dashboard data.</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {isInitialLoading ? (
          <div className="rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-900/70 to-gray-900/70 p-8 text-center text-purple-200">
            Fetching the latest data feeds...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <LeaderboardTable
                title="Billing Leaderboard Current Financial Year"
                data={billingLeaderboard}
                rowKey={(row) => row.employee}
                columns={[
                  { key: 'rank', header: '#', align: 'left', render: (_, index) => index + 1 },
                  { key: 'employee', header: 'Employee', align: 'left' },
                  {
                    key: 'enquiries',
                    header: 'Number of Enquiries',
                    align: 'right',
                    render: (row) => formatNumber(row.enquiries),
                  },
                  {
                    key: 'amount',
                    header: 'Sum of Amount',
                    align: 'right',
                    render: (row) =>
                      formatCurrency(row.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                  },
                ]}
              />

              <LeaderboardTable
                title="Enquiry by Team Member"
                data={enquiryByMember}
                rowKey={(row) => row.employee}
                columns={[
                  { key: 'rank', header: '#', align: 'left', render: (_, index) => index + 1 },
                  { key: 'employee', header: 'Employee', align: 'left' },
                  {
                    key: 'enquiries',
                    header: 'Number of Enquiries',
                    align: 'right',
                    render: (row) => formatNumber(row.enquiries),
                  },
                  {
                    key: 'amount',
                    header: 'Sum of Amount',
                    align: 'right',
                    render: (row) =>
                      formatCurrency(row.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <LeaderboardTable
                title="Enquiries by Team"
                data={enquiriesByTeam}
                rowKey={(row) => row.team}
                columns={[
                  { key: 'rank', header: '#', align: 'left', render: (_, index) => index + 1 },
                  { key: 'team', header: 'Team', align: 'left' },
                  {
                    key: 'enquiries',
                    header: 'Count of Enquiries',
                    align: 'right',
                    render: (row) => formatNumber(row.enquiries),
                  },
                  {
                    key: 'revenue',
                    header: 'Sum of Revenue',
                    align: 'right',
                    render: (row) => formatCurrency(row.revenue),
                  },
                ]}
              />

              <LeaderboardTable
                title="Outgoing Enquiries Created Leaderboard"
                data={outgoingEnquiries}
                rowKey={(row) => row.employee}
                columns={[
                  { key: 'rank', header: '#', align: 'left', render: (_, index) => index + 1 },
                  { key: 'employee', header: 'Employee', align: 'left' },
                  {
                    key: 'outgoingEnquiries',
                    header: 'Number of Outgoing Enquiries',
                    align: 'right',
                    render: (row) => formatNumber(row.outgoingEnquiries),
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:justify-items-center">
              <div className="w-full max-w-xl">
                <SalesBarChart title="This Month's Sales" data={monthlySales} />
              </div>

              <div className="w-full max-w-lg">
                <TargetGauge
                  title="Current Pipeline vs £360k Target"
                  data={pipeline.gaugeData}
                  domain={pipeline.domain}
                  targetAngle={pipeline.targetAngle}
                  totalAmount={pipeline.totalAmount}
                  targetAmount={pipeline.targetAmount}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZohoAnalyticsDashboard;
