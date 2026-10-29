/**
 * Shipping fee calculation utility
 * Calculates delivery fee based on destination country and city.
 */

const SHIPPING_RATES = {
  METRO_MANILA: 0.0,
  PROVINCIAL: 150.0,
  INTERNATIONAL: 1200.0
};

const METRO_MANILA_KEYWORDS = [
  'manila',
  'metro manila',
  'ncr',
  'quezon city',
  'makati',
  'taguig',
  'pasig',
  'mandaluyong',
  'san juan',
  'pasay',
  'parañaque',
  'paranaque',
  'las piñas',
  'las pinas',
  'muntinlupa',
  'marikina',
  'caloocan',
  'malabon',
  'navotas',
  'valenzuela',
  'pateros',
  'bgc',
  'bonifacio global city'
];

/**
 * Calculate shipping fee based on country and city
 * @param {string} country
 * @param {string} city
 * @returns {{ fee: number, label: string, zone: 'manila' | 'provincial' | 'international' }}
 */
function calculateShippingFee(country = 'Philippines', city = '') {
  const normCountry = (country || '').trim().toLowerCase();
  const normCity = (city || '').trim().toLowerCase();

  // Outside the country (International)
  if (normCountry !== 'philippines' && normCountry !== 'ph') {
    return {
      fee: SHIPPING_RATES.INTERNATIONAL,
      label: 'International Express Shipping (Outside Philippines)',
      zone: 'international'
    };
  }

  // Check if destination is within Metro Manila
  const isManila = METRO_MANILA_KEYWORDS.some(kw => normCity.includes(kw));

  if (isManila) {
    return {
      fee: SHIPPING_RATES.METRO_MANILA,
      label: 'Metro Manila Standard (FREE)',
      zone: 'manila'
    };
  }

  // Outside Manila (Provincial Philippines)
  return {
    fee: SHIPPING_RATES.PROVINCIAL,
    label: 'Provincial Delivery (Outside Manila)',
    zone: 'provincial'
  };
}

module.exports = {
  SHIPPING_RATES,
  calculateShippingFee
};
