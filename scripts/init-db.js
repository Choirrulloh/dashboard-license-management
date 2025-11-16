require('dotenv').config();
const { initializeDatabase } = require('../config/schema');
const database = require('../config/database');
const { User } = require('../models');

async function createDefaultAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findByUsername('admin');

    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Change this in production!
        role: 'admin'
      });
      console.log('✓ Default admin user created (username: admin, password: admin123)');
      console.log('  IMPORTANT: Change the admin password after first login!');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Database Initialization Script');
    console.log('='.repeat(60));

    // Initialize database schema
    await initializeDatabase();

    // Create default admin user
    await createDefaultAdmin();

    console.log('='.repeat(60));
    console.log('Database initialization completed successfully!');
    console.log('='.repeat(60));

    // Close database connection
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    await database.close();
    process.exit(1);
  }
}

// Run the script
main();
