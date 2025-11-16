const database = require('../config/database');
const crypto = require('crypto');

class License {
  static generateLicenseKey() {
    // Generate a unique license key format: XXXX-XXXX-XXXX-XXXX
    const segments = [];
    for (let i = 0; i < 4; i++) {
      const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
      segments.push(segment);
    }
    return segments.join('-');
  }

  static async create(licenseData) {
    const {
      product_id,
      customer_id,
      type,
      expiry_date,
      max_activations = 1,
      license_key = null
    } = licenseData;

    const key = license_key || this.generateLicenseKey();

    const sql = `
      INSERT INTO licenses (
        license_key, product_id, customer_id, type,
        expiry_date, max_activations, status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `;
    const result = await database.run(sql, [
      key,
      product_id,
      customer_id,
      type,
      expiry_date,
      max_activations
    ]);
    return { id: result.id, license_key: key };
  }

  static async findById(id) {
    const sql = `
      SELECT l.*, p.name as product_name, c.name as customer_name, c.email as customer_email
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE l.id = ?
    `;
    return await database.get(sql, [id]);
  }

  static async findByKey(licenseKey) {
    const sql = `
      SELECT l.*, p.name as product_name, c.name as customer_name, c.email as customer_email
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE l.license_key = ?
    `;
    return await database.get(sql, [licenseKey]);
  }

  static async findAll() {
    const sql = `
      SELECT l.*, p.name as product_name, c.name as customer_name
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      ORDER BY l.created_at DESC
    `;
    return await database.all(sql);
  }

  static async findByCustomer(customerId) {
    const sql = `
      SELECT l.*, p.name as product_name
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.customer_id = ?
      ORDER BY l.created_at DESC
    `;
    return await database.all(sql, [customerId]);
  }

  static async findByProduct(productId) {
    const sql = `
      SELECT l.*, c.name as customer_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      WHERE l.product_id = ?
      ORDER BY l.created_at DESC
    `;
    return await database.all(sql, [productId]);
  }

  static async update(id, licenseData) {
    const { type, expiry_date, status, max_activations } = licenseData;
    const sql = `
      UPDATE licenses
      SET type = ?, expiry_date = ?, status = ?, max_activations = ?
      WHERE id = ?
    `;
    const result = await database.run(sql, [type, expiry_date, status, max_activations, id]);
    return result.changes > 0;
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE licenses SET status = ? WHERE id = ?';
    const result = await database.run(sql, [status, id]);
    return result.changes > 0;
  }

  static async incrementActivations(id) {
    const sql = `
      UPDATE licenses
      SET current_activations = current_activations + 1
      WHERE id = ? AND current_activations < max_activations
    `;
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async decrementActivations(id) {
    const sql = `
      UPDATE licenses
      SET current_activations = current_activations - 1
      WHERE id = ? AND current_activations > 0
    `;
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM licenses WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async validate(licenseKey) {
    const license = await this.findByKey(licenseKey);

    if (!license) {
      return { valid: false, message: 'License key not found' };
    }

    if (license.status !== 'active') {
      return { valid: false, message: `License is ${license.status}` };
    }

    const now = new Date();
    const expiryDate = new Date(license.expiry_date);

    if (expiryDate < now) {
      await this.updateStatus(license.id, 'expired');
      return { valid: false, message: 'License has expired' };
    }

    if (license.current_activations >= license.max_activations) {
      return { valid: false, message: 'Maximum activations reached' };
    }

    return {
      valid: true,
      message: 'License is valid',
      license: license
    };
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM licenses';
    const result = await database.get(sql);
    return result.count;
  }

  static async countByStatus(status) {
    const sql = 'SELECT COUNT(*) as count FROM licenses WHERE status = ?';
    const result = await database.get(sql, [status]);
    return result.count;
  }

  static async getExpiringLicenses(days = 30) {
    const sql = `
      SELECT l.*, p.name as product_name, c.name as customer_name, c.email as customer_email
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE l.status = 'active'
        AND l.expiry_date <= datetime('now', '+' || ? || ' days')
        AND l.expiry_date > datetime('now')
      ORDER BY l.expiry_date ASC
    `;
    return await database.all(sql, [days]);
  }
}

module.exports = License;
