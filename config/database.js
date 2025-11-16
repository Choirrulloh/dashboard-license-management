const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', 'data', 'license_management.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable journal mode for better concurrency
db.pragma('journal_mode = WAL');

module.exports = db;
