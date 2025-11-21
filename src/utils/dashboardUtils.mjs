import pipelineCsv from '../data/pipeline.csv?raw';

const parseCurrencyToNumber = (value) => {
  if (typeof value === 'number') return value;
  const numericValue = value.replace(/[^0-9.-]+/g, '');
  return Number.parseFloat(numericValue) || 0;
};

export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'GBP',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = 'standard',
  } = options;

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(value);
};

export const formatNumber = (value) => (Number.isFinite(value) ? value.toLocaleString() : '0');

const splitCsvRow = (row) => {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map((value) => value.trim());
};

const parseCsvToRecords = (csvText) => {
  if (!csvText) {
    return [];
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = splitCsvRow(lines[0]);

  return lines.slice(1).map((line) => {
    const cells = splitCsvRow(line);
    const record = {};

    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });

    return record;
  });
};

const billingLeaderboardRaw = [
  { employee: 'Rachel Bryant', enquiries: 5, amount: 514202 },
  { employee: 'James McGloin', enquiries: 6, amount: 231595 },
  { employee: 'Oliver Smith', enquiries: 85, amount: 185676 },
  { employee: 'Matt Percival', enquiries: 55, amount: 161926 },
  { employee: 'Alex Limpenny', enquiries: 44, amount: 144467 },
  { employee: 'Joe Grainge', enquiries: 42, amount: 84191 },
  { employee: 'Jack Spear', enquiries: 47, amount: 82313 },
  { employee: 'Jasper  Hayes', enquiries: 45, amount: 79503 },
  { employee: 'Ben Smallwood', enquiries: 5, amount: 66916 },
  { employee: 'Ramona Dixon-Fyle', enquiries: 47, amount: 40201 },
  { employee: 'Natalia  Pacey', enquiries: 22, amount: 32910 },
  { employee: 'Dominique Thompson', enquiries: 55, amount: 30540 },
  { employee: 'Karen Wilson', enquiries: 16, amount: 30205 },
  { employee: 'LBB Admin', enquiries: 73, amount: 24927 },
  { employee: 'Anthony Godwin', enquiries: 18, amount: 15799 },
  { employee: 'Joseph Lenihan', enquiries: 6, amount: 4840 },
  { employee: 'Leah Bray', enquiries: 3, amount: 4597 },
  { employee: 'Jenny Wilson', enquiries: 1, amount: 2050 },
  { employee: 'Lucie Fallan', enquiries: 1, amount: 38 },
  { employee: 'Thomas Alberto', enquiries: 1, amount: 1 },
];

const enquiryByTeamMemberRaw = [
  { employee: 'Oliver Smith', enquiries: 130, amount: 218846 },
  { employee: 'Dominique Thompson', enquiries: 85, amount: 59363 },
  { employee: 'Matt Percival', enquiries: 59, amount: 384028 },
  { employee: 'Denise  Williamson', enquiries: 57, amount: 13877 },
  { employee: 'Jack Spear', enquiries: 48, amount: 107110 },
  { employee: 'Joe Grainge', enquiries: 39, amount: 55112 },
  { employee: 'Anthony Godwin', enquiries: 37, amount: 33941 },
  { employee: 'Natalia  Pacey', enquiries: 37, amount: 43636 },
  { employee: 'Alex Limpenny', enquiries: 36, amount: 426769 },
  { employee: 'Jasper  Hayes', enquiries: 26, amount: 45055 },
  { employee: 'Ramona Dixon-Fyle', enquiries: 23, amount: 8806 },
  { employee: 'Joseph Lenihan', enquiries: 18, amount: 11835 },
  { employee: 'James McGloin', enquiries: 9, amount: 703811 },
  { employee: 'Rachel Bryant', enquiries: 9, amount: 527112 },
  { employee: 'LBB Admin', enquiries: 9, amount: 7338 },
  { employee: 'Karen Wilson', enquiries: 6, amount: 8972 },
  { employee: 'Leah Bray', enquiries: 4, amount: 13840 },
  { employee: 'Thomas Alberto', enquiries: 1, amount: 1 },
  { employee: 'Thomas Morrissey', enquiries: 1, amount: 1201 },
];

const enquiriesByTeamRaw = [
  { team: 'Major Projects Team', enquiries: 17, revenue: 310168.02 },
  { team: 'Core Team', enquiries: 47, revenue: 102394.3 },
  { team: 'Client Services Team', enquiries: 40, revenue: 13853.27 },
  { team: 'Buildsafe Team', enquiries: 20, revenue: 10300.83 },
];

const monthlySalesRaw = [
  { owner: 'Alex Limpenny', amount: parseCurrencyToNumber('£ 20,950.00') },
  { owner: 'Anthony Godwin', amount: parseCurrencyToNumber('£ 3,762.51') },
  { owner: 'Denise  Williamson', amount: parseCurrencyToNumber('£ 4,561.93') },
  { owner: 'Dominique Thompson', amount: parseCurrencyToNumber('£ 3,980.22') },
  { owner: 'Jack Spear', amount: parseCurrencyToNumber('£ 16,797.33') },
  { owner: 'James McGloin', amount: parseCurrencyToNumber('£ 99,324.63') },
  { owner: 'Jasper  Hayes', amount: parseCurrencyToNumber('£ 2,572.48') },
  { owner: 'Joe Grainge', amount: parseCurrencyToNumber('£ 6,220.19') },
  { owner: 'Joseph Lenihan', amount: parseCurrencyToNumber('£ 1,951.97') },
  { owner: 'LBB Admin', amount: parseCurrencyToNumber('£ 7,338.37') },
  { owner: 'Matt Percival', amount: parseCurrencyToNumber('£ 71,551.21') },
  { owner: 'Natalia  Pacey', amount: parseCurrencyToNumber('£ 9,420.77') },
  { owner: 'Oliver Smith', amount: parseCurrencyToNumber('£ 42,671.02') },
  { owner: 'Rachel Bryant', amount: parseCurrencyToNumber('£ 139,292.18') },
  { owner: 'Ramona Dixon-Fyle', amount: parseCurrencyToNumber('£ 6,320.61') },
  { owner: 'Thomas Alberto', amount: parseCurrencyToNumber('£ 1.00') },
];

const outgoingEnquiriesRaw = [
  { employee: 'Oliver Smith', outgoingEnquiries: 117 },
  { employee: 'Matt Percival', outgoingEnquiries: 53 },
  { employee: 'Jack Spear', outgoingEnquiries: 34 },
  { employee: 'Alex Limpenny', outgoingEnquiries: 32 },
  { employee: 'Joe Grainge', outgoingEnquiries: 27 },
  { employee: 'Natalia  Pacey', outgoingEnquiries: 23 },
  { employee: 'Dominique Thompson', outgoingEnquiries: 19 },
  { employee: 'Jasper  Hayes', outgoingEnquiries: 15 },
  { employee: 'Anthony Godwin', outgoingEnquiries: 8 },
  { employee: 'James McGloin', outgoingEnquiries: 8 },
  { employee: 'Rachel Bryant', outgoingEnquiries: 8 },
  { employee: 'Leah Bray', outgoingEnquiries: 3 },
  { employee: 'Joseph Lenihan', outgoingEnquiries: 3 },
  { employee: 'LBB Admin', outgoingEnquiries: 3 },
  { employee: 'Ramona Dixon-Fyle', outgoingEnquiries: 2 },
  { employee: 'Karen Wilson', outgoingEnquiries: 2 },
  { employee: 'Thomas Morrissey', outgoingEnquiries: 1 },
];

const sortDescending = (array, key) => [...array].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));

export const billingLeaderboardData = sortDescending(billingLeaderboardRaw, 'amount');
export const enquiryByTeamMemberData = sortDescending(enquiryByTeamMemberRaw, 'enquiries');
export const enquiriesByTeamData = sortDescending(enquiriesByTeamRaw, 'enquiries');
export const monthlySalesData = sortDescending(monthlySalesRaw, 'amount');
export const outgoingEnquiriesData = sortDescending(outgoingEnquiriesRaw, 'outgoingEnquiries');

const pipelineRecords = parseCsvToRecords(pipelineCsv);
const pipelineTotalAmountValue = pipelineRecords.reduce(
  (sum, record) => sum + parseCurrencyToNumber(record.Amount ?? '0'),
  0,
);
const pipelineTargetAmountValue = 360000;
const pipelineGaugeDomainMax = Math.max(pipelineTargetAmountValue, pipelineTotalAmountValue);

const computeAngle = (ratio) => 270 - ratio * 180;
const safeRatio = (value) => {
  if (pipelineGaugeDomainMax === 0) return 0;
  return Math.min(value / pipelineGaugeDomainMax, 1);
};

const pipelineTargetAngle = computeAngle(safeRatio(pipelineTargetAmountValue));

export const pipelineGaugeData = [
  { name: 'Pipeline Amount', value: pipelineTotalAmountValue, fill: '#a855f7' },
];
export const pipelineGaugeDomain = [0, pipelineGaugeDomainMax];
export const pipelineGaugeTargetAngle = pipelineTargetAngle;
export const pipelineTotalAmount = pipelineTotalAmountValue;
export const pipelineTargetAmount = pipelineTargetAmountValue;

