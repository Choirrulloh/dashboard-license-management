const database = require('../config/database');

class ActivityLog {
  static async create(logData) {
    const { license_id, action, ip_address = null, user_agent = null } = logData;
    const sql = `
      INSERT INTO activity_logs (license_id, action, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `;
    const result = await database.run(sql, [license_id, action, ip_address, user_agent]);
    return result.id;
  }

  static async findById(id) {
    const sql = `
      SELECT al.*, l.license_key, p.name as product_name, c.name as customer_name
      FROM activity_logs al
      JOIN licenses l ON al.license_id = l.id
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE al.id = ?
    `;
    return await database.get(sql, [id]);
  }

  static async findByLicense(licenseId, limit = 50) {
    const sql = `
      SELECT * FROM activity_logs
      WHERE license_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    return await database.all(sql, [licenseId, limit]);
  }

  static async findAll(limit = 100) {
    const sql = `
      SELECT al.*, l.license_key, p.name as product_name, c.name as customer_name
      FROM activity_logs al
      JOIN licenses l ON al.license_id = l.id
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    return await database.all(sql, [limit]);
  }

  static async findByAction(action, limit = 50) {
    const sql = `
      SELECT al.*, l.license_key, p.name as product_name, c.name as customer_name
      FROM activity_logs al
      JOIN licenses l ON al.license_id = l.id
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE al.action = ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    return await database.all(sql, [action, limit]);
  }

  static async findByDateRange(startDate, endDate, limit = 100) {
    const sql = `
      SELECT al.*, l.license_key, p.name as product_name, c.name as customer_name
      FROM activity_logs al
      JOIN licenses l ON al.license_id = l.id
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE al.timestamp BETWEEN ? AND ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    return await database.all(sql, [startDate, endDate, limit]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM activity_logs WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async deleteOldLogs(daysToKeep = 90) {
    const sql = `
      DELETE FROM activity_logs
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `;
    const result = await database.run(sql, [daysToKeep]);
    return result.changes;
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM activity_logs';
    const result = await database.get(sql);
    return result.count;
  }

  static async countByAction(action) {
    const sql = 'SELECT COUNT(*) as count FROM activity_logs WHERE action = ?';
    const result = await database.get(sql, [action]);
    return result.count;
  }

  static async getRecentActivity(hours = 24, limit = 50) {
    const sql = `
      SELECT al.*, l.license_key, p.name as product_name, c.name as customer_name
      FROM activity_logs al
      JOIN licenses l ON al.license_id = l.id
      JOIN products p ON l.product_id = p.id
      JOIN customers c ON l.customer_id = c.id
      WHERE al.timestamp >= datetime('now', '-' || ? || ' hours')
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    return await database.all(sql, [hours, limit]);
  }
}

module.exports = ActivityLog;
