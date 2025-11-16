const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All product routes require authentication
router.use(authenticateToken);

// Get all products with pagination
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Get product statistics
router.get('/:id/stats', productController.getProductStats);

// Create new product (admin only)
router.post('/', authorizeRole(['admin']), productController.createProduct);

// Update product (admin only)
router.put('/:id', authorizeRole(['admin']), productController.updateProduct);

// Toggle product active status (admin only)
router.patch('/:id/toggle-status', authorizeRole(['admin']), productController.toggleProductStatus);

// Delete product (admin only)
router.delete('/:id', authorizeRole(['admin']), productController.deleteProduct);

module.exports = router;
