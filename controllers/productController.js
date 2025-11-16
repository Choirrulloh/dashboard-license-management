const db = require('../config/database');

// Get all products with pagination
exports.getAllProducts = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      countQuery += ' WHERE name LIKE ? OR description LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const products = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

    // Get license count for each product
    const productsWithCounts = products.map(product => {
      const { count } = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE product_id = ?')
        .get(product.id);
      return {
        ...product,
        license_count: count
      };
    });

    res.json({
      products: productsWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

// Get single product by ID
exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product's licenses
    const licenses = db.prepare(`
      SELECT l.*, c.name as customer_name, c.email as customer_email
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      WHERE l.product_id = ?
      ORDER BY l.created_at DESC
    `).all(id);

    res.json({
      ...product,
      licenses
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
};

// Create new product
exports.createProduct = (req, res) => {
  try {
    const { name, version, description, price, license_type } = req.body;

    // Validate required fields
    if (!name || !version) {
      return res.status(400).json({ error: 'Name and version are required' });
    }

    // Check if product with same name and version exists
    const existingProduct = db.prepare('SELECT id FROM products WHERE name = ? AND version = ?')
      .get(name, version);

    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this name and version already exists' });
    }

    // Insert product
    const result = db.prepare(`
      INSERT INTO products (name, version, description, price, license_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, version, description || null, price || null, license_type || 'perpetual');

    // Get the created product
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, version, description, price, license_type, is_active } = req.body;

    // Check if product exists
    const existingProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if name/version combination is being changed and if it's already taken
    if ((name || version) && (name !== existingProduct.name || version !== existingProduct.version)) {
      const nameVersionTaken = db.prepare('SELECT id FROM products WHERE name = ? AND version = ? AND id != ?')
        .get(name || existingProduct.name, version || existingProduct.version, id);

      if (nameVersionTaken) {
        return res.status(400).json({ error: 'Product with this name and version already exists' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (version !== undefined) {
      updates.push('version = ?');
      values.push(version);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (license_type !== undefined) {
      updates.push('license_type = ?');
      values.push(license_type);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Get updated product
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has licenses
    const licenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE product_id = ?').get(id);

    if (licenses.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete product with existing licenses',
        licenseCount: licenses.count
      });
    }

    // Delete product
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get product statistics
exports.getProductStats = (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get license statistics
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_licenses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_licenses,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_licenses,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked_licenses
      FROM licenses
      WHERE product_id = ?
    `).get(id);

    res.json({
      product,
      stats
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve product statistics' });
  }
};

// Toggle product active status
exports.toggleProductStatus = (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Toggle is_active
    const newStatus = product.is_active ? 0 : 1;
    db.prepare('UPDATE products SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, id);

    // Get updated product
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
};
