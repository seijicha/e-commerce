/**
 * Generate a URL-friendly slug from a text string
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  if (!text) {
    return '';
  }
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = slugify;
