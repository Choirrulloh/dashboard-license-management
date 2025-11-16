const fs = require('fs');
const path = require('path');
const db = require('../config/database');

function migrate() {
  try {
    console.log('Starting database migration...');

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const schema = fs.readFileSync('./config/schema.sql', 'utf8');
    db.exec(schema);

    console.log('✅ Database migration completed successfully!');
    console.log(`📁 Database location: ${path.join(dataDir, 'license_management.db')}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

migrate();
