const database = require('./database');

const schema = {
  // Products table
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      version VARCHAR(50),
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Customers table
  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      company VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // License types table
  license_types: `
    CREATE TABLE IF NOT EXISTS license_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      duration_days INTEGER NOT NULL,
      price_multiplier DECIMAL(5, 2) DEFAULT 1.00,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Licenses table
  licenses: `
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key VARCHAR(255) NOT NULL UNIQUE,
      product_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATETIME,
      status VARCHAR(50) DEFAULT 'active',
      max_activations INTEGER DEFAULT 1,
      current_activations INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `,

  // Activity logs table
  activity_logs: `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
    )
  `,

  // Users table for authentication
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
};

// Indexes for better performance
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_customer_id ON licenses(customer_id)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key)',
  'CREATE INDEX IF NOT EXISTS idx_activity_logs_license_id ON activity_logs(license_id)',
  'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
];

// Default license types
const defaultLicenseTypes = [
  {
    name: 'Trial',
    duration_days: 30,
    price_multiplier: 0.00,
    features: JSON.stringify(['Limited Features', 'Email Support'])
  },
  {
    name: 'Monthly',
    duration_days: 30,
    price_multiplier: 1.00,
    features: JSON.stringify(['Full Features', 'Email Support', 'Updates'])
  },
  {
    name: 'Yearly',
    duration_days: 365,
    price_multiplier: 10.00,
    features: JSON.stringify(['Full Features', 'Priority Support', 'Updates', 'Custom Integration'])
  },
  {
    name: 'Lifetime',
    duration_days: 36500,
    price_multiplier: 50.00,
    features: JSON.stringify(['Full Features', 'Lifetime Support', 'Lifetime Updates', 'Custom Integration', 'Source Code Access'])
  }
];

async function initializeDatabase() {
  try {
    await database.connect();
    console.log('Starting database initialization...');

    // Create tables
    for (const [tableName, createSQL] of Object.entries(schema)) {
      await database.run(createSQL);
      console.log(`✓ Table '${tableName}' created/verified`);
    }

    // Create indexes
    for (const indexSQL of indexes) {
      await database.run(indexSQL);
    }
    console.log('✓ Indexes created/verified');

    // Insert default license types if not exists
    for (const licenseType of defaultLicenseTypes) {
      const existing = await database.get(
        'SELECT id FROM license_types WHERE name = ?',
        [licenseType.name]
      );

      if (!existing) {
        await database.run(
          'INSERT INTO license_types (name, duration_days, price_multiplier, features) VALUES (?, ?, ?, ?)',
          [licenseType.name, licenseType.duration_days, licenseType.price_multiplier, licenseType.features]
        );
        console.log(`✓ Default license type '${licenseType.name}' created`);
      }
    }

    console.log('Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeDatabase, schema, indexes };
