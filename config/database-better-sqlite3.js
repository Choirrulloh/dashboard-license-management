// Alternative database configuration using better-sqlite3
// To use this, rename this file to database.js (backup the original first)
// Or: pnpm remove sqlite3 && pnpm add better-sqlite3

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.db = new Database(DB_PATH, { verbose: console.log });
        console.log('Connected to SQLite database');

        // Enable foreign keys
        this.db.pragma('foreign_keys = ON');
        resolve(this.db);
      } catch (err) {
        console.error('Error connecting to database:', err.message);
        reject(err);
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = this.db.prepare(sql);
        const info = stmt.run(params);
        resolve({ id: info.lastInsertRowid, changes: info.changes });
      } catch (err) {
        reject(err);
      }
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = this.db.prepare(sql);
        const row = stmt.get(params);
        resolve(row);
      } catch (err) {
        reject(err);
      }
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(params);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      try {
        if (this.db) {
          this.db.close();
          console.log('Database connection closed');
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

// Create singleton instance
const database = new DatabaseWrapper();

module.exports = database;
