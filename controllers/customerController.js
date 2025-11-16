const db = require('../config/database');

// Get all customers with pagination
exports.getAllCustomers = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM customers';
    let countQuery = 'SELECT COUNT(*) as total FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR company LIKE ?';
      countQuery += ' WHERE name LIKE ? OR email LIKE ? OR company LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const customers = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

    res.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
};

// Get single customer by ID
exports.getCustomerById = (req, res) => {
  try {
    const { id } = req.params;

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer's licenses
    const licenses = db.prepare(`
      SELECT l.*, p.name as product_name
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.customer_id = ?
      ORDER BY l.created_at DESC
    `).all(id);

    res.json({
      ...customer,
      licenses
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
};

// Create new customer
exports.createCustomer = (req, res) => {
  try {
    const { name, email, phone, company, address, notes } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingCustomer = db.prepare('SELECT id FROM customers WHERE email = ?').get(email);

    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer with this email already exists' });
    }

    // Insert customer
    const result = db.prepare(`
      INSERT INTO customers (name, email, phone, company, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, phone || null, company || null, address || null, notes || null);

    // Get the created customer
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
exports.updateCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address, notes } = req.body;

    // Check if customer exists
    const existingCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingCustomer.email) {
      const emailTaken = db.prepare('SELECT id FROM customers WHERE email = ? AND id != ?').get(email, id);

      if (emailTaken) {
        return res.status(400).json({ error: 'Email already in use by another customer' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
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

    db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Get updated customer
    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
exports.deleteCustomer = (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has active licenses
    const activeLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE customer_id = ?').get(id);

    if (activeLicenses.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with active licenses',
        activeLicenses: activeLicenses.count
      });
    }

    // Delete customer
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customer statistics
exports.getCustomerStats = (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get license statistics
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_licenses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_licenses,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_licenses,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked_licenses
      FROM licenses
      WHERE customer_id = ?
    `).get(id);

    res.json({
      customer,
      stats
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer statistics' });
  }
};
