const env = require('../config/env');

/**
 * Format a number/decimal to currency string
 * @param {number|string} amount
 * @param {string} [currency]
 * @returns {string}
 */
function formatMoney(amount, currency = env.CURRENCY) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (currency === 'PHP') {
    return `₱${formatted}`;
  }
  return `${currency} ${formatted}`;
}

module.exports = {
  formatMoney
};
