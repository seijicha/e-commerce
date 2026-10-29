const crypto = require('crypto');

/**
 * Generate a unique, recognizable order number
 * Format: GA-YYYYMMDD-XXXX
 * @returns {string}
 */
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `GA-${year}${month}${day}-${randomSuffix}`;
}

module.exports = {
  generateOrderNumber
};
