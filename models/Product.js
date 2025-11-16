const database = require('../config/database');

class Product {
  static async create(productData) {
    const { name, description, version, price } = productData;
    const sql = `
      INSERT INTO products (name, description, version, price)
      VALUES (?, ?, ?, ?)
    `;
    const result = await database.run(sql, [name, description, version, price]);
    return result.id;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM products WHERE id = ?';
    return await database.get(sql, [id]);
  }

  static async findAll() {
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
    return await database.all(sql);
  }

  static async update(id, productData) {
    const { name, description, version, price } = productData;
    const sql = `
      UPDATE products
      SET name = ?, description = ?, version = ?, price = ?
      WHERE id = ?
    `;
    const result = await database.run(sql, [name, description, version, price, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM products WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async search(searchTerm) {
    const sql = `
      SELECT * FROM products
      WHERE name LIKE ? OR description LIKE ? OR version LIKE ?
      ORDER BY created_at DESC
    `;
    const term = `%${searchTerm}%`;
    return await database.all(sql, [term, term, term]);
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM products';
    const result = await database.get(sql);
    return result.count;
  }
}

module.exports = Product;
