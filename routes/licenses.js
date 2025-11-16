const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Web routes
router.get('/', licenseController.getAllLicenses);
router.get('/create', licenseController.showCreateForm);
router.post('/create', licenseController.createLicense);
router.get('/:id', licenseController.getLicense);
router.get('/:id/edit', licenseController.showEditForm);
router.post('/:id/edit', licenseController.updateLicense);
router.post('/:id/delete', licenseController.deleteLicense);
router.post('/:id/suspend', licenseController.suspendLicense);
router.post('/:id/reactivate', licenseController.reactivateLicense);

module.exports = router;
