const crypto = require('crypto');
const db = require('../config/database');

// Generate a unique license key
const generateLicenseKey = () => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return segments.join('-');
};

// Get all licenses with pagination and filters
exports.getAllLicenses = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const customerId = req.query.customer_id;
    const productId = req.query.product_id;

    let query = `
      SELECT l.*,
             c.name as customer_name,
             c.email as customer_email,
             p.name as product_name,
             p.version as product_version
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM licenses l';
    const params = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push('l.status = ?');
      params.push(status);
    }
    if (customerId) {
      whereConditions.push('l.customer_id = ?');
      params.push(customerId);
    }
    if (productId) {
      whereConditions.push('l.product_id = ?');
      params.push(productId);
    }

    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';

    const licenses = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

    res.json({
      licenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: 'Failed to retrieve licenses' });
  }
};

// Get single license by ID
exports.getLicenseById = (req, res) => {
  try {
    const { id } = req.params;

    const license = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             c.email as customer_email,
             c.company as customer_company,
             p.name as product_name,
             p.version as product_version,
             p.description as product_description
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(id);

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    res.json(license);
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Failed to retrieve license' });
  }
};

// Create new license
exports.createLicense = (req, res) => {
  try {
    const { customer_id, product_id, license_type, max_activations, expiry_date, notes } = req.body;

    // Validate required fields
    if (!customer_id || !product_id) {
      return res.status(400).json({ error: 'Customer ID and Product ID are required' });
    }

    // Verify customer exists
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Verify product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Generate unique license key
    let licenseKey;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      licenseKey = generateLicenseKey();
      const existing = db.prepare('SELECT id FROM licenses WHERE license_key = ?').get(licenseKey);
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique license key' });
    }

    // Insert license
    const result = db.prepare(`
      INSERT INTO licenses (
        license_key, customer_id, product_id, license_type,
        status, max_activations, current_activations, expiry_date, notes
      )
      VALUES (?, ?, ?, ?, 'active', ?, 0, ?, ?)
    `).run(
      licenseKey,
      customer_id,
      product_id,
      license_type || 'perpetual',
      max_activations || null,
      expiry_date || null,
      notes || null
    );

    // Get the created license
    const newLicense = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             c.email as customer_email,
             p.name as product_name,
             p.version as product_version
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'License created successfully',
      license: newLicense
    });
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({ error: 'Failed to create license' });
  }
};

// Update license
exports.updateLicense = (req, res) => {
  try {
    const { id } = req.params;
    const { status, max_activations, expiry_date, notes } = req.body;

    // Check if license exists
    const existingLicense = db.prepare('SELECT * FROM licenses WHERE id = ?').get(id);

    if (!existingLicense) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (max_activations !== undefined) {
      updates.push('max_activations = ?');
      values.push(max_activations);
    }
    if (expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      values.push(expiry_date);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE licenses SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Get updated license
    const updatedLicense = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             c.email as customer_email,
             p.name as product_name,
             p.version as product_version
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(id);

    res.json({
      message: 'License updated successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({ error: 'Failed to update license' });
  }
};

// Delete license
exports.deleteLicense = (req, res) => {
  try {
    const { id } = req.params;

    // Check if license exists
    const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(id);

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Delete license
    db.prepare('DELETE FROM licenses WHERE id = ?').run(id);

    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    console.error('Delete license error:', error);
    res.status(500).json({ error: 'Failed to delete license' });
  }
};

// Revoke license
exports.revokeLicense = (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if license exists
    const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(id);

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    if (license.status === 'revoked') {
      return res.status(400).json({ error: 'License is already revoked' });
    }

    // Update license status
    const notes = reason ? `${license.notes || ''}\nRevoked: ${reason}` : license.notes;
    db.prepare('UPDATE licenses SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('revoked', notes, id);

    // Get updated license
    const updatedLicense = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(id);

    res.json({
      message: 'License revoked successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Revoke license error:', error);
    res.status(500).json({ error: 'Failed to revoke license' });
  }
};

// Validate license (Public API endpoint)
exports.validateLicense = (req, res) => {
  try {
    const { license_key, product_id } = req.body;

    if (!license_key) {
      return res.status(400).json({
        valid: false,
        error: 'License key is required'
      });
    }

    // Get license
    const license = db.prepare(`
      SELECT l.*, p.name as product_name, p.version as product_version
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.license_key = ?
    `).get(license_key);

    if (!license) {
      return res.json({
        valid: false,
        error: 'Invalid license key'
      });
    }

    // Check if product matches (if provided)
    if (product_id && license.product_id !== parseInt(product_id)) {
      return res.json({
        valid: false,
        error: 'License key does not match product'
      });
    }

    // Check if license is active
    if (license.status !== 'active') {
      return res.json({
        valid: false,
        error: `License is ${license.status}`,
        status: license.status
      });
    }

    // Check if license is expired
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const now = new Date();
      if (expiryDate < now) {
        // Update status to expired
        db.prepare('UPDATE licenses SET status = ? WHERE id = ?').run('expired', license.id);

        return res.json({
          valid: false,
          error: 'License has expired',
          expiry_date: license.expiry_date
        });
      }
    }

    // Check activation limit
    if (license.max_activations && license.current_activations >= license.max_activations) {
      return res.json({
        valid: false,
        error: 'Maximum activations reached',
        max_activations: license.max_activations,
        current_activations: license.current_activations
      });
    }

    // License is valid
    res.json({
      valid: true,
      license: {
        license_key: license.license_key,
        product_name: license.product_name,
        product_version: license.product_version,
        license_type: license.license_type,
        expiry_date: license.expiry_date,
        max_activations: license.max_activations,
        current_activations: license.current_activations
      }
    });
  } catch (error) {
    console.error('Validate license error:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate license'
    });
  }
};

// Activate license
exports.activateLicense = (req, res) => {
  try {
    const { license_key, machine_id } = req.body;

    if (!license_key || !machine_id) {
      return res.status(400).json({
        success: false,
        error: 'License key and machine ID are required'
      });
    }

    // Get license
    const license = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(license_key);

    if (!license) {
      return res.status(404).json({
        success: false,
        error: 'Invalid license key'
      });
    }

    // Check if license is active
    if (license.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: `License is ${license.status}`
      });
    }

    // Check if expired
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const now = new Date();
      if (expiryDate < now) {
        db.prepare('UPDATE licenses SET status = ? WHERE id = ?').run('expired', license.id);
        return res.status(400).json({
          success: false,
          error: 'License has expired'
        });
      }
    }

    // Check activation limit
    if (license.max_activations && license.current_activations >= license.max_activations) {
      return res.status(400).json({
        success: false,
        error: 'Maximum activations reached',
        max_activations: license.max_activations
      });
    }

    // Increment activation count
    db.prepare('UPDATE licenses SET current_activations = current_activations + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(license.id);

    res.json({
      success: true,
      message: 'License activated successfully',
      activations: {
        current: license.current_activations + 1,
        max: license.max_activations
      }
    });
  } catch (error) {
    console.error('Activate license error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate license'
    });
  }
};

// Deactivate license
exports.deactivateLicense = (req, res) => {
  try {
    const { license_key, machine_id } = req.body;

    if (!license_key || !machine_id) {
      return res.status(400).json({
        success: false,
        error: 'License key and machine ID are required'
      });
    }

    // Get license
    const license = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(license_key);

    if (!license) {
      return res.status(404).json({
        success: false,
        error: 'Invalid license key'
      });
    }

    // Decrement activation count (but not below 0)
    if (license.current_activations > 0) {
      db.prepare('UPDATE licenses SET current_activations = current_activations - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(license.id);
    }

    res.json({
      success: true,
      message: 'License deactivated successfully',
      activations: {
        current: Math.max(0, license.current_activations - 1),
        max: license.max_activations
      }
    });
  } catch (error) {
    console.error('Deactivate license error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate license'
    });
  }
};
