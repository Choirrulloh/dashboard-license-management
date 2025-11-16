const database = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const result = await database.run(sql, [username, email, hashedPassword, role]);
    return result.id;
  }

  static async findById(id) {
    const sql = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?';
    return await database.get(sql, [id]);
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    return await database.get(sql, [username]);
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await database.get(sql, [email]);
  }

  static async findAll() {
    const sql = 'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC';
    return await database.all(sql);
  }

  static async update(id, userData) {
    const { username, email, role } = userData;
    const sql = `
      UPDATE users
      SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await database.run(sql, [username, email, role, id]);
    return result.changes > 0;
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const sql = `
      UPDATE users
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await database.run(sql, [hashedPassword, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async authenticate(username, password) {
    const user = await this.findByUsername(username);

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    const isValid = await this.verifyPassword(password, user.password);

    if (!isValid) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }

  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM users';
    const result = await database.get(sql);
    return result.count;
  }

  static async countByRole(role) {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE role = ?';
    const result = await database.get(sql, [role]);
    return result.count;
  }
}

module.exports = User;
