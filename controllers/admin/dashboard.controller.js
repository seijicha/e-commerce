const DashboardService = require('../../services/dashboard.service');

const DashboardController = {
  async index(req, res, next) {
    try {
      const stats = await DashboardService.getOverviewStats();
      res.render('admin/dashboard/index', {
        title: 'Dashboard — Admin Console',
        stats,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DashboardController;
