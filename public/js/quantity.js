function formatMoneyClient(amount) {
  const num = parseFloat(amount) || 0;
  return '₱' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalculateCartTotals() {
  let subtotal = 0;
  let totalItems = 0;

  const rows = document.querySelectorAll('[data-cart-row]');
  rows.forEach(row => {
    const input = row.querySelector('[data-stepper-input]');
    const unitPrice = parseFloat(row.getAttribute('data-unit-price')) || 0;
    const qty = parseInt(input?.value, 10) || 0;
    const lineTotal = unitPrice * qty;

    const lineTotalEl = row.querySelector('[data-line-total]');
    if (lineTotalEl) {
      lineTotalEl.textContent = formatMoneyClient(lineTotal);
    }

    subtotal += lineTotal;
    totalItems += qty;
  });

  const subtotalEl = document.querySelector('[data-cart-subtotal]');
  if (subtotalEl) {
    subtotalEl.textContent = formatMoneyClient(subtotal);
  }

  const grandTotalEl = document.querySelector('[data-cart-grand-total]');
  if (grandTotalEl) {
    grandTotalEl.textContent = formatMoneyClient(subtotal);
  }

  const totalItemsEl = document.querySelector('[data-cart-total-items]');
  if (totalItemsEl) {
    totalItemsEl.textContent = totalItems;
  }
}

const syncTimeouts = new Map();

function syncCartItemQuantity(form, input) {
  const action = form.getAttribute('action');
  if (!action) {
    return;
  }

  const csrfToken = form.querySelector('input[name="_csrf"]')?.value || '';
  const quantity = input.value;

  if (syncTimeouts.has(action)) {
    clearTimeout(syncTimeouts.get(action));
  }

  const timer = setTimeout(async () => {
    try {
      const response = await fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
          _csrf: csrfToken,
          quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.cart) {
          const grandTotalEl = document.querySelector('[data-cart-grand-total]');
          const subtotalEl = document.querySelector('[data-cart-subtotal]');
          if (grandTotalEl && data.cart.total) {
            grandTotalEl.textContent = formatMoneyClient(data.cart.total);
          }
          if (subtotalEl && data.cart.subtotal) {
            subtotalEl.textContent = formatMoneyClient(data.cart.subtotal);
          }
        }
      } else {
        form.submit();
      }
    } catch {
      form.submit();
    }
  }, 350);

  syncTimeouts.set(action, timer);
}

export function initQuantitySteppers() {
  const steppers = document.querySelectorAll('[data-stepper]');

  steppers.forEach(stepper => {
    const input = stepper.querySelector('[data-stepper-input]');
    const btnDec = stepper.querySelector('[data-stepper-dec]');
    const btnInc = stepper.querySelector('[data-stepper-inc]');
    const form = stepper.closest('form');
    const isInCart = Boolean(stepper.closest('[data-cart-row]'));

    if (!input) {
      return;
    }

    const min = parseInt(input.getAttribute('min'), 10) || 1;
    const max = parseInt(input.getAttribute('max'), 10) || 99;

    const handleUpdate = () => {
      if (isInCart) {
        recalculateCartTotals();
        if (form) {
          syncCartItemQuantity(form, input);
        }
      } else {
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    btnDec?.addEventListener('click', e => {
      e.preventDefault();
      let val = parseInt(input.value, 10) || min;
      if (val > min) {
        input.value = val - 1;
        handleUpdate();
      }
    });

    btnInc?.addEventListener('click', e => {
      e.preventDefault();
      let val = parseInt(input.value, 10) || min;
      if (val < max) {
        input.value = val + 1;
        handleUpdate();
      }
    });

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < min) {
        val = min;
      }
      if (val > max) {
        val = max;
      }
      input.value = val;
      handleUpdate();
    });

    if (form && isInCart) {
      input.removeAttribute('onchange');
    }
  });
}
