// frontend/src/utils/currency.js

/**
 * Format number as Indonesian Rupiah
 * @param {number} amount - Amount in IDR
 * @param {boolean} includeSymbol - Whether to include 'Rp' prefix
 * @returns {string} Formatted currency string
 */
export const formatIDR = (amount, includeSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? 'Rp 0' : '0';
  }
  
  // Round to nearest integer (IDR has no decimals)
  const amountInt = Math.round(Number(amount));
  
  // Format with Indonesian thousands separator (dot)
  const formatted = amountInt.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return includeSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Parse Indonesian Rupiah string to number
 * @param {string} currencyString - e.g., "Rp 1.000.000"
 * @returns {number} Amount as integer
 */
export const parseIDR = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove 'Rp' and formatting
  const cleaned = currencyString
    .replace(/Rp\s?/gi, '')
    .replace(/\./g, '')  // Remove thousands separator
    .replace(/,/g, '.')  // Convert decimal comma to dot
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

/**
 * Currency configuration
 */
export const CURRENCY = {
  code: 'IDR',
  symbol: 'Rp',
  symbolPosition: 'before', // 'before' or 'after'
  decimalPlaces: 0,
  thousandsSeparator: '.',
  decimalSeparator: ',',
};

export default { formatIDR, parseIDR, CURRENCY };