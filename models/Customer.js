const database = require('../config/database');

class Customer {
  static async create(customerData) {
    const { name, email, company, phone, address } = customerData;
    const sql = `
      INSERT INTO customers (name, email, company, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await database.run(sql, [name, email, company, phone, address]);
    return result.id;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    return await database.get(sql, [id]);
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM customers WHERE email = ?';
    return await database.get(sql, [email]);
  }

  static async findAll() {
    const sql = 'SELECT * FROM customers ORDER BY created_at DESC';
    return await database.all(sql);
  }

  static async update(id, customerData) {
    const { name, email, company, phone, address } = customerData;
    const sql = `
      UPDATE customers
      SET name = ?, email = ?, company = ?, phone = ?, address = ?
      WHERE id = ?
    `;
    const result = await database.run(sql, [name, email, company, phone, address, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async search(searchTerm) {
    const sql = `
      SELECT * FROM customers
      WHERE name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ?
      ORDER BY created_at DESC
    `;
    const term = `%${searchTerm}%`;
    return await database.all(sql, [term, term, term, term]);
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM customers';
    const result = await database.get(sql);
    return result.count;
  }

  static async getLicenses(customerId) {
    const sql = `
      SELECT l.*, p.name as product_name
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.customer_id = ?
      ORDER BY l.created_at DESC
    `;
    return await database.all(sql, [customerId]);
  }
}

module.exports = Customer;
