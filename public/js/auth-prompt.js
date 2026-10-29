/**
 * Auth Prompt Handler
 * Intercepts clicks on customer-only navigation actions (Cart, Orders, Account)
 * for unauthenticated guests, displaying a styled modal container allowing users
 * to cancel or proceed to log in with an intact redirect target.
 */
export function initAuthPrompt() {
  const dialog = document.getElementById('auth-prompt-dialog');
  const messageElement = document.getElementById('auth-prompt-message');
  const cancelBtn = document.getElementById('auth-prompt-cancel');
  const loginLink = document.getElementById('auth-prompt-confirm');

  if (!dialog) {
    return;
  }

  cancelBtn?.addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-auth-required="true"], .js-auth-required');
    if (!trigger) {
      return;
    }

    event.preventDefault();

    const feature = trigger.getAttribute('data-auth-feature') || 'this feature';
    const targetUrl = trigger.getAttribute('href') || '/login';

    if (messageElement) {
      messageElement.textContent = `Please log in first to access your ${feature}.`;
    }

    if (loginLink) {
      loginLink.href = `/login?next=${encodeURIComponent(targetUrl)}`;
    }

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  });
}
