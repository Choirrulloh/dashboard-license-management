require('dotenv').config();
const { Product, Customer, License, LicenseType, User } = require('../models');
const database = require('../config/database');

async function testBackend() {
  try {
    await database.connect();
    console.log('✓ Database connected\n');

    console.log('='.repeat(60));
    console.log('Testing Backend Functionality');
    console.log('='.repeat(60));

    // Test 1: Create a product
    console.log('\n1. Creating test product...');
    const productId = await Product.create({
      name: 'Test Software Pro',
      description: 'A professional testing software',
      version: '2.0.0',
      price: 99.99
    });
    console.log(`✓ Product created with ID: ${productId}`);

    // Test 2: Create a customer
    console.log('\n2. Creating test customer...');
    const customerId = await Customer.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Test Corp',
      phone: '+1234567890',
      address: '123 Test Street'
    });
    console.log(`✓ Customer created with ID: ${customerId}`);

    // Test 3: Get license type
    console.log('\n3. Fetching license type...');
    const licenseType = await LicenseType.findByName('Monthly');
    console.log(`✓ License type found: ${licenseType.name} (${licenseType.duration_days} days)`);

    // Test 4: Generate a license
    console.log('\n4. Generating test license...');
    const moment = require('moment');
    const expiryDate = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss');

    const licenseResult = await License.create({
      product_id: productId,
      customer_id: customerId,
      type: 'Monthly',
      expiry_date: expiryDate,
      max_activations: 5
    });
    console.log(`✓ License generated:`);
    console.log(`  - ID: ${licenseResult.id}`);
    console.log(`  - Key: ${licenseResult.license_key}`);

    // Test 5: Validate the license
    console.log('\n5. Validating license...');
    const validation = await License.validate(licenseResult.license_key);
    console.log(`✓ License validation: ${validation.valid ? 'VALID' : 'INVALID'}`);
    console.log(`  - Message: ${validation.message}`);

    // Test 6: Activate the license
    console.log('\n6. Activating license...');
    const activated = await License.incrementActivations(licenseResult.id);
    console.log(`✓ License activated: ${activated ? 'YES' : 'NO'}`);

    // Test 7: Check license details
    console.log('\n7. Fetching license details...');
    const license = await License.findById(licenseResult.id);
    console.log(`✓ License details:`);
    console.log(`  - Product: ${license.product_name}`);
    console.log(`  - Customer: ${license.customer_name}`);
    console.log(`  - Status: ${license.status}`);
    console.log(`  - Activations: ${license.current_activations}/${license.max_activations}`);
    console.log(`  - Expires: ${license.expiry_date}`);

    // Test 8: User authentication test
    console.log('\n8. Testing user authentication...');
    const authResult = await User.authenticate('admin', 'admin123');
    console.log(`✓ Authentication: ${authResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (authResult.success) {
      console.log(`  - User: ${authResult.user.username}`);
      console.log(`  - Role: ${authResult.user.role}`);
    }

    // Test 9: Get statistics
    console.log('\n9. Getting statistics...');
    const totalProducts = await Product.count();
    const totalCustomers = await Customer.count();
    const totalLicenses = await License.count();
    const activeLicenses = await License.countByStatus('active');
    console.log(`✓ Statistics:`);
    console.log(`  - Total Products: ${totalProducts}`);
    console.log(`  - Total Customers: ${totalCustomers}`);
    console.log(`  - Total Licenses: ${totalLicenses}`);
    console.log(`  - Active Licenses: ${activeLicenses}`);

    console.log('\n' + '='.repeat(60));
    console.log('All backend tests completed successfully!');
    console.log('='.repeat(60));

    await database.close();
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    await database.close();
    process.exit(1);
  }
}

testBackend();
