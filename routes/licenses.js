const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public endpoints for license validation and activation
router.post('/validate', licenseController.validateLicense);
router.post('/activate', licenseController.activateLicense);
router.post('/deactivate', licenseController.deactivateLicense);

// Protected routes - require authentication
router.use(authenticateToken);

// Get all licenses with pagination and filters
router.get('/', licenseController.getAllLicenses);

// Get single license by ID
router.get('/:id', licenseController.getLicenseById);

// Create new license (admin only)
router.post('/', authorizeRole(['admin']), licenseController.createLicense);

// Update license (admin only)
router.put('/:id', authorizeRole(['admin']), licenseController.updateLicense);

// Revoke license (admin only)
router.post('/:id/revoke', authorizeRole(['admin']), licenseController.revokeLicense);

// Delete license (admin only)
router.delete('/:id', authorizeRole(['admin']), licenseController.deleteLicense);

module.exports = router;
