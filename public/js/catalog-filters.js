/**
 * Catalog Filters & Sorting Handler
 * Automatically submits search & filter form when category or sort order changes.
 */
export function initCatalogFilters() {
  const form = document.querySelector('[data-catalog-filter-form]');
  if (!form) {
    return;
  }

  const selects = form.querySelectorAll('[data-filter-select]');
  selects.forEach(select => {
    select.addEventListener('change', () => {
      form.submit();
    });
  });
}
