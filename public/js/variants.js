export function initVariantManager() {
  const container = document.querySelector('[data-variants-container]');
  const addBtn = document.querySelector('[data-add-variant]');

  if (!container || !addBtn) {
    return;
  }

  addBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'variant-row';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.marginBottom = '0.5rem';
    row.setAttribute('data-variant-row', '');

    row.innerHTML = `
      <div style="flex: 1;">
        <input type="text" name="variant_sizes[]" placeholder="Size (e.g. M, L, XL)" class="form-input" required />
      </div>
      <div style="flex: 1;">
        <input type="number" name="variant_stocks[]" placeholder="Stock" min="0" value="0" class="form-input" required />
      </div>
      <div>
        <button type="button" class="btn btn--danger btn--sm" data-remove-variant title="Remove Size">✕</button>
      </div>
    `;

    container.appendChild(row);
  });

  container.addEventListener('click', event => {
    const removeBtn = event.target.closest('[data-remove-variant]');
    if (removeBtn) {
      const row = removeBtn.closest('[data-variant-row]');
      if (row) {
        row.remove();
      }
    }
  });
}
