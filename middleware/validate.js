const { validationResult } = require('express-validator');

/**
 * Middleware factory to handle express-validator results
 * @param {string} [viewPath] View template to re-render on failure
 * @param {Function} [additionalDataFn] Optional async callback to supply view data (e.g. categories)
 */
function handleValidation(viewPath, additionalDataFn) {
  return async (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.mapped();
    const firstErrorMessage =
      result.array()[0]?.msg || 'Validation failed. Please check your inputs.';

    if (viewPath) {
      let extraData = {};
      if (typeof additionalDataFn === 'function') {
        try {
          extraData = await additionalDataFn(req);
        } catch (err) {
          return next(err);
        }
      }

      res.locals.flash = {
        success: [],
        error: [firstErrorMessage],
        info: []
      };
      return res.status(400).render(viewPath, {
        errors,
        formData: req.body,
        ...extraData
      });
    }

    req.flash('error', firstErrorMessage);
    const redirectUrl = req.header('Referer') || '/';
    return res.redirect(redirectUrl);
  };
}

module.exports = {
  handleValidation
};
