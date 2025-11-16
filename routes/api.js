const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const productController = require('../controllers/productController');
const customerController = require('../controllers/customerController');
const licenseController = require('../controllers/licenseController');
const { verifyToken } = require('../middleware/auth');

// Public API routes (no authentication required)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// License validation and activation (public for client apps)
router.post('/licenses/validate', licenseController.validateLicense);
router.post('/licenses/activate', licenseController.activateLicense);
router.post('/licenses/deactivate', licenseController.deactivateLicense);

// Protected API routes (require JWT token)
router.use(verifyToken);

// Auth
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/logout', authController.logout);

// Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Products
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Customers
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/search', customerController.searchCustomers);
router.get('/customers/:id', customerController.getCustomer);
router.post('/customers', customerController.createCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);

// Licenses
router.get('/licenses', licenseController.getAllLicenses);
router.get('/licenses/:id', licenseController.getLicense);
router.post('/licenses', licenseController.createLicense);
router.put('/licenses/:id', licenseController.updateLicense);
router.delete('/licenses/:id', licenseController.deleteLicense);
router.post('/licenses/:id/suspend', licenseController.suspendLicense);
router.post('/licenses/:id/reactivate', licenseController.reactivateLicense);

module.exports = router;
