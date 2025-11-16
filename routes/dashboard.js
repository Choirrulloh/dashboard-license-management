const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard route
router.get('/', isAuthenticated, dashboardController.showDashboard);

module.exports = router;
