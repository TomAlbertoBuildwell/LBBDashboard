import React from 'react';
import LeaderboardTable from './components/LeaderboardTable.jsx';
import SalesBarChart from './components/SalesBarChart.jsx';
import TargetGauge from './components/TargetGauge.jsx';
import {
  billingLeaderboardData,
  enquiryByTeamMemberData,
  enquiriesByTeamData,
  monthlySalesData,
  outgoingEnquiriesData,
  formatCurrency,
  formatNumber,
  pipelineGaugeData,
  pipelineGaugeDomain,
  pipelineGaugeTargetAngle,
  pipelineTotalAmount,
  pipelineTargetAmount,
} from './utils/dashboardUtils.mjs';

const ZohoAnalyticsDashboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Zoho Analytics Dashboard</h1>
        <p className="text-purple-300">Team Performance Overview</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LeaderboardTable
          title="Billing Leaderboard Current Financial Year"
          data={billingLeaderboardData}
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
              render: (row) => formatCurrency(row.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            },
          ]}
        />

        <LeaderboardTable
          title="Enquiry by Team Member"
          data={enquiryByTeamMemberData}
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
              render: (row) => formatCurrency(row.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LeaderboardTable
          title="Enquiries by Team"
          data={enquiriesByTeamData}
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
          data={outgoingEnquiriesData}
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
          <SalesBarChart title="This Month's Sales" data={monthlySalesData} />
        </div>

        <div className="w-full max-w-lg">
          <TargetGauge
            title="Current Pipeline vs £360k Target"
            data={pipelineGaugeData}
            domain={pipelineGaugeDomain}
            targetAngle={pipelineGaugeTargetAngle}
            totalAmount={pipelineTotalAmount}
            targetAmount={pipelineTargetAmount}
          />
        </div>
      </div>
    </div>
  </div>
);

export default ZohoAnalyticsDashboard;
