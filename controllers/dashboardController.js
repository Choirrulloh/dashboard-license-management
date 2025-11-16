const { Product, Customer, License, LicenseType, ActivityLog } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Render dashboard page
const showDashboard = asyncHandler(async (req, res) => {
  // Get statistics
  const stats = await getDashboardStats();

  res.render('dashboard/index', {
    title: 'Dashboard',
    user: {
      username: req.session.username,
      role: req.session.userRole
    },
    stats
  });
});

// Get dashboard statistics (API endpoint)
const getDashboardStats = asyncHandler(async (req, res) => {
  // Count totals
  const totalProducts = await Product.count();
  const totalCustomers = await Customer.count();
  const totalLicenses = await License.count();

  // Count licenses by status
  const activeLicenses = await License.countByStatus('active');
  const expiredLicenses = await License.countByStatus('expired');
  const suspendedLicenses = await License.countByStatus('suspended');

  // Get expiring licenses (next 30 days)
  const expiringLicenses = await License.getExpiringLicenses(30);

  // Get recent activity
  const recentActivity = await ActivityLog.getRecentActivity(24, 10);

  // Get recent licenses
  const recentLicenses = await License.findAll();
  const recentLicensesList = recentLicenses.slice(0, 5);

  const stats = {
    totals: {
      products: totalProducts,
      customers: totalCustomers,
      licenses: totalLicenses,
      activeLicenses,
      expiredLicenses,
      suspendedLicenses
    },
    expiring: expiringLicenses.length,
    expiringLicenses: expiringLicenses.slice(0, 5),
    recentActivity: recentActivity,
    recentLicenses: recentLicensesList
  };

  // If this is an API request, return JSON
  if (req && res && req.path && req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      stats
    });
  }

  // Otherwise return the stats object (for use in views)
  return stats;
});

module.exports = {
  showDashboard,
  getDashboardStats
};
