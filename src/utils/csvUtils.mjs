export const parseCurrencyToNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numericValue = value.toString().replace(/[^0-9.-]+/g, '');
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
  }).format(value ?? 0);
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

export const parseCsvToRecords = (csvText) => {
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

export const sortDescending = (array, key) => [...array].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));

