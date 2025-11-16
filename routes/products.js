const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Web routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/create', productController.showCreateForm);
router.post('/create', productController.createProduct);
router.get('/:id', productController.getProduct);
router.get('/:id/edit', productController.showEditForm);
router.post('/:id/edit', productController.updateProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;
