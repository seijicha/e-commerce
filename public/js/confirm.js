export function initConfirmDialogs() {
  const dialog = document.getElementById('confirm-delete-dialog');
  const confirmForm = document.getElementById('confirm-delete-form');
  const messageElement = document.getElementById('confirm-delete-message');
  const cancelBtn = document.getElementById('confirm-delete-cancel');

  if (!dialog || !confirmForm) {
    return;
  }

  cancelBtn?.addEventListener('click', () => {
    dialog.close();
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-confirm]');
    if (!trigger) {
      return;
    }

    event.preventDefault();

    const actionUrl = trigger.getAttribute('data-action') || trigger.getAttribute('href');
    const message =
      trigger.getAttribute('data-confirm-message') ||
      'Are you sure you want to proceed with this deletion? This action cannot be undone.';

    if (messageElement) {
      messageElement.textContent = message;
    }

    if (actionUrl) {
      confirmForm.action = actionUrl;
    }

    dialog.showModal();
  });
}
