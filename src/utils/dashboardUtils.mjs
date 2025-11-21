import {
  parseCsvToRecords,
  parseCurrencyToNumber,
  formatCurrency,
  formatNumber,
  sortDescending,
} from './csvUtils.mjs';

export { formatCurrency, formatNumber } from './csvUtils.mjs';

export const PIPELINE_TARGET_AMOUNT = 360000;

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return parseCurrencyToNumber(value);
};

const ensureRecords = (csvText) => parseCsvToRecords(csvText ?? '');

export const transformBillingLeaderboard = (csvText) => {
  const shaped = ensureRecords(csvText)
    .filter((record) => record.Employee)
    .map((record) => ({
      employee: record.Employee,
      enquiries: toNumber(record['Number of Enquiries']),
      amount: parseCurrencyToNumber(record['Sum of Amount']),
    }));

  return sortDescending(shaped, 'amount');
};

export const transformEnquiryByTeamMember = (csvText) => {
  const shaped = ensureRecords(csvText)
    .filter((record) => record.Employee)
    .map((record) => ({
      employee: record.Employee,
      enquiries: toNumber(record['Number of Enquiries']),
      amount: parseCurrencyToNumber(record['Sum of Amount']),
    }));

  return sortDescending(shaped, 'enquiries');
};

export const transformEnquiriesByTeam = (csvText) => {
  const shaped = ensureRecords(csvText)
    .filter((record) => record.Team)
    .map((record) => ({
      team: record.Team,
      enquiries: toNumber(record['Count of Enquiries']),
      revenue: parseCurrencyToNumber(record['Sum of Revenue']),
    }));

  return sortDescending(shaped, 'enquiries');
};

export const transformMonthlySales = (csvText) => {
  const shaped = ensureRecords(csvText)
    .filter((record) => record['Enquiry Owner Name'])
    .map((record) => ({
      owner: record['Enquiry Owner Name'],
      amount: parseCurrencyToNumber(record['Total Amount']),
    }));

  return sortDescending(shaped, 'amount');
};

export const transformOutgoingEnquiries = (csvText) => {
  const shaped = ensureRecords(csvText)
    .filter((record) => record.Employee)
    .map((record) => ({
      employee: record.Employee,
      outgoingEnquiries: toNumber(record['Number of Outgoing Enquiries']),
    }));

  return sortDescending(shaped, 'outgoingEnquiries');
};

export const transformPipelineData = (csvText, targetAmount = PIPELINE_TARGET_AMOUNT) => {
  const records = ensureRecords(csvText);
  const totalAmount = records.reduce(
    (sum, record) => sum + parseCurrencyToNumber(record.Amount ?? record['Sum of Amount']),
    0,
  );
  const domainMax = Math.max(targetAmount, totalAmount);
  const computeAngle = (ratio) => 270 - ratio * 180;
  const ratio = domainMax === 0 ? 0 : Math.min(targetAmount / domainMax, 1);

  return {
    gaugeData: [{ name: 'Pipeline Amount', value: totalAmount, fill: '#a855f7' }],
    domain: [0, domainMax || targetAmount],
    targetAngle: computeAngle(ratio),
    totalAmount,
    targetAmount,
  };
};