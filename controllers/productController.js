const { Product } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll();

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      count: products.length,
      products
    });
  }

  res.render('products/index', {
    title: 'Products',
    user: { username: req.session.username, role: req.session.userRole },
    products
  });
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    throw new Error('Product not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      product
    });
  }

  res.render('products/view', {
    title: `Product: ${product.name}`,
    user: { username: req.session.username, role: req.session.userRole },
    product
  });
});

// Show create product form
const showCreateForm = (req, res) => {
  res.render('products/create', {
    title: 'Create Product',
    user: { username: req.session.username, role: req.session.userRole },
    error: null
  });
};

// Create product
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, version, price } = req.body;

  if (!name || !price) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    return res.render('products/create', {
      title: 'Create Product',
      user: { username: req.session.username, role: req.session.userRole },
      error: 'Name and price are required'
    });
  }

  const productId = await Product.create({
    name,
    description: description || '',
    version: version || '1.0.0',
    price: parseFloat(price)
  });

  if (req.path.startsWith('/api/')) {
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId
    });
  }

  res.redirect('/products');
});

// Show edit product form
const showEditForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new Error('Product not found');
  }

  res.render('products/edit', {
    title: `Edit Product: ${product.name}`,
    user: { username: req.session.username, role: req.session.userRole },
    product,
    error: null
  });
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, version, price } = req.body;

  if (!name || !price) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    const product = await Product.findById(id);
    return res.render('products/edit', {
      title: `Edit Product: ${product.name}`,
      user: { username: req.session.username, role: req.session.userRole },
      product,
      error: 'Name and price are required'
    });
  }

  const updated = await Product.update(id, {
    name,
    description: description || '',
    version: version || '1.0.0',
    price: parseFloat(price)
  });

  if (!updated) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    throw new Error('Product not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'Product updated successfully'
    });
  }

  res.redirect('/products');
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Product.delete(id);

  if (!deleted) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    throw new Error('Product not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  }

  res.redirect('/products');
});

// Search products
const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.redirect('/products');
  }

  const products = await Product.search(q);

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      count: products.length,
      products
    });
  }

  res.render('products/index', {
    title: 'Products - Search Results',
    user: { username: req.session.username, role: req.session.userRole },
    products,
    searchQuery: q
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  showCreateForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct,
  searchProducts
};
