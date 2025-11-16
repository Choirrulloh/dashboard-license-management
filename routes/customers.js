const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Web routes
router.get('/', customerController.getAllCustomers);
router.get('/search', customerController.searchCustomers);
router.get('/create', customerController.showCreateForm);
router.post('/create', customerController.createCustomer);
router.get('/:id', customerController.getCustomer);
router.get('/:id/edit', customerController.showEditForm);
router.post('/:id/edit', customerController.updateCustomer);
router.post('/:id/delete', customerController.deleteCustomer);

module.exports = router;
