/**
 * Checkout Dynamic Shipping Fee Calculation
 * Dynamically computes and displays shipping rates for Manila, Provincial, and International orders.
 */

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

export function initCheckoutShipping() {
  const form = document.querySelector('[data-checkout-form]');
  const countrySelect = document.getElementById('shipping_country');
  const cityInput = document.getElementById('shipping_city');
  const shippingDisplay = document.getElementById('checkout-shipping-display');
  const totalDisplay = document.getElementById('checkout-total-display');
  const subtotalEl = document.getElementById('checkout-subtotal');

  if (!form || !countrySelect || !cityInput || !shippingDisplay || !totalDisplay || !subtotalEl) {
    return;
  }

  const subtotal = parseFloat(subtotalEl.getAttribute('data-subtotal')) || 0;

  function updateShipping() {
    const country = (countrySelect.value || '').trim().toLowerCase();
    const city = (cityInput.value || '').trim().toLowerCase();

    let fee = 0;
    let label = '';
    let isFree = false;

    if (country !== 'philippines' && country !== 'ph') {
      fee = 1200;
      label = 'International Express';
    } else {
      const isManila = METRO_MANILA_KEYWORDS.some(kw => city.includes(kw));
      if (isManila || city.length === 0) {
        fee = 0;
        label = 'Metro Manila (FREE)';
        isFree = true;
      } else {
        fee = 150;
        label = 'Provincial Delivery (Outside Manila)';
      }
    }

    if (isFree) {
      shippingDisplay.innerHTML = `<span style="color: var(--color-success); font-weight: 600;">FREE</span> <span style="font-size: 0.78rem; color: var(--color-muted);">(Metro Manila)</span>`;
    } else {
      const formattedFee = `₱${fee.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
      shippingDisplay.innerHTML = `<span style="color: var(--color-text); font-weight: 600;">${formattedFee}</span> <span style="display: block; font-size: 0.75rem; color: var(--color-muted);">${label}</span>`;
    }

    const grandTotal = subtotal + fee;
    totalDisplay.textContent = `₱${grandTotal.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  countrySelect.addEventListener('change', updateShipping);
  cityInput.addEventListener('input', updateShipping);
  cityInput.addEventListener('change', updateShipping);

  // Initial calculation on page load
  updateShipping();
}
