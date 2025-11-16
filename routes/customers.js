const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All customer routes require authentication
router.use(authenticateToken);

// Get all customers with pagination
router.get('/', customerController.getAllCustomers);

// Get single customer by ID
router.get('/:id', customerController.getCustomerById);

// Get customer statistics
router.get('/:id/stats', customerController.getCustomerStats);

// Create new customer (admin only)
router.post('/', authorizeRole(['admin']), customerController.createCustomer);

// Update customer (admin only)
router.put('/:id', authorizeRole(['admin']), customerController.updateCustomer);

// Delete customer (admin only)
router.delete('/:id', authorizeRole(['admin']), customerController.deleteCustomer);

module.exports = router;
