const database = require('../config/database');

class LicenseType {
  static async create(typeData) {
    const { name, duration_days, price_multiplier, features } = typeData;
    const featuresJSON = typeof features === 'string' ? features : JSON.stringify(features);

    const sql = `
      INSERT INTO license_types (name, duration_days, price_multiplier, features)
      VALUES (?, ?, ?, ?)
    `;
    const result = await database.run(sql, [name, duration_days, price_multiplier, featuresJSON]);
    return result.id;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM license_types WHERE id = ?';
    const type = await database.get(sql, [id]);
    if (type && type.features) {
      type.features = JSON.parse(type.features);
    }
    return type;
  }

  static async findByName(name) {
    const sql = 'SELECT * FROM license_types WHERE name = ?';
    const type = await database.get(sql, [name]);
    if (type && type.features) {
      type.features = JSON.parse(type.features);
    }
    return type;
  }

  static async findAll() {
    const sql = 'SELECT * FROM license_types ORDER BY duration_days ASC';
    const types = await database.all(sql);
    return types.map(type => {
      if (type.features) {
        type.features = JSON.parse(type.features);
      }
      return type;
    });
  }

  static async update(id, typeData) {
    const { name, duration_days, price_multiplier, features } = typeData;
    const featuresJSON = typeof features === 'string' ? features : JSON.stringify(features);

    const sql = `
      UPDATE license_types
      SET name = ?, duration_days = ?, price_multiplier = ?, features = ?
      WHERE id = ?
    `;
    const result = await database.run(sql, [name, duration_days, price_multiplier, featuresJSON, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM license_types WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM license_types';
    const result = await database.get(sql);
    return result.count;
  }
}

module.exports = LicenseType;
