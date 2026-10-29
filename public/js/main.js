import { initQuantitySteppers } from './quantity.js';
import { initImagePreview } from './image-preview.js';
import { initVariantManager } from './variants.js';
import { initConfirmDialogs } from './confirm.js';
import { initAuthPrompt } from './auth-prompt.js';
import { initScrollAnimate } from './scroll-animate.js';
import { initHeroIntro } from './hero-intro.js';
import { initCheckoutShipping } from './checkout-shipping.js';
import { initCatalogFilters } from './catalog-filters.js';

document.addEventListener('DOMContentLoaded', () => {
  initQuantitySteppers();
  initImagePreview();
  initVariantManager();
  initConfirmDialogs();
  initAuthPrompt();
  initScrollAnimate();
  initHeroIntro();
  initCheckoutShipping();
  initCatalogFilters();
});
