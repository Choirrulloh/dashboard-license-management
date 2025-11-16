const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard overview statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get license statistics by date range
router.get('/license-stats', dashboardController.getLicenseStatsByDateRange);

// Get product performance report
router.get('/product-performance', dashboardController.getProductPerformance);

// Get customer activity report
router.get('/customer-activity', dashboardController.getCustomerActivity);

// Get revenue report
router.get('/revenue', dashboardController.getRevenueReport);

// Get expiring licenses report
router.get('/expiring-licenses', dashboardController.getExpiringLicenses);

// Get license type distribution
router.get('/license-distribution', dashboardController.getLicenseTypeDistribution);

// Get monthly growth report
router.get('/monthly-growth', dashboardController.getMonthlyGrowth);

// Get activation statistics
router.get('/activation-stats', dashboardController.getActivationStats);

module.exports = router;
