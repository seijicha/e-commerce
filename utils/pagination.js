/**
 * Calculate pagination metadata
 * @param {number} totalItems
 * @param {number} currentPage
 * @param {number} itemsPerPage
 * @returns {object}
 */
function getPagination(totalItems, currentPage = 1, itemsPerPage = 10) {
  const page = Math.max(1, parseInt(currentPage, 10) || 1);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return {
    currentPage: page,
    itemsPerPage,
    totalItems,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    prevPage: page - 1,
    nextPage: page + 1
  };
}

module.exports = {
  getPagination
};
