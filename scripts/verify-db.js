require('dotenv').config();
const database = require('../config/database');

async function verifyDatabase() {
  try {
    await database.connect();

    console.log('\n=== Database Tables ===\n');

    const tables = await database.all(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `);

    for (const table of tables) {
      console.log(`📋 ${table.name}`);

      const tableInfo = await database.all(`PRAGMA table_info(${table.name})`);
      tableInfo.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
      });

      const count = await database.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`   Records: ${count.count}\n`);
    }

    console.log('=== License Types ===\n');
    const licenseTypes = await database.all('SELECT * FROM license_types');
    licenseTypes.forEach(type => {
      console.log(`- ${type.name}: ${type.duration_days} days (${type.price_multiplier}x multiplier)`);
    });

    console.log('\n=== Users ===\n');
    const users = await database.all('SELECT username, email, role FROM users');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    await database.close();
  } catch (error) {
    console.error('Error:', error);
    await database.close();
  }
}

verifyDatabase();
