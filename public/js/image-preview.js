export function initImagePreview() {
  const fileInputs = document.querySelectorAll('[data-image-input]');

  fileInputs.forEach(input => {
    const previewTargetId = input.getAttribute('data-image-preview');
    const previewContainer = previewTargetId ? document.getElementById(previewTargetId) : null;

    if (!previewContainer) {
      return;
    }

    input.addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPEG, PNG, or WebP).');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        let img = previewContainer.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'product-card__image';
          previewContainer.innerHTML = '';
          previewContainer.appendChild(img);
        }
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  });
}
