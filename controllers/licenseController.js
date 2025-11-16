const { License, LicenseType, Product, Customer, ActivityLog } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const moment = require('moment');

// Get all licenses
const getAllLicenses = asyncHandler(async (req, res) => {
  const licenses = await License.findAll();

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      count: licenses.length,
      licenses
    });
  }

  res.render('licenses/index', {
    title: 'Licenses',
    user: { username: req.session.username, role: req.session.userRole },
    licenses
  });
});

// Get single license
const getLicense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const license = await License.findById(id);

  if (!license) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    throw new Error('License not found');
  }

  // Get activity logs
  const activityLogs = await ActivityLog.findByLicense(id, 20);

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      license: {
        ...license,
        activityLogs
      }
    });
  }

  res.render('licenses/view', {
    title: `License: ${license.license_key}`,
    user: { username: req.session.username, role: req.session.userRole },
    license,
    activityLogs
  });
});

// Show create license form
const showCreateForm = asyncHandler(async (req, res) => {
  const products = await Product.findAll();
  const customers = await Customer.findAll();
  const licenseTypes = await LicenseType.findAll();

  res.render('licenses/create', {
    title: 'Create License',
    user: { username: req.session.username, role: req.session.userRole },
    products,
    customers,
    licenseTypes,
    error: null
  });
});

// Generate/Create license
const createLicense = asyncHandler(async (req, res) => {
  const { product_id, customer_id, type, max_activations, custom_expiry } = req.body;

  if (!product_id || !customer_id || !type) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Product, customer, and license type are required'
      });
    }

    const products = await Product.findAll();
    const customers = await Customer.findAll();
    const licenseTypes = await LicenseType.findAll();

    return res.render('licenses/create', {
      title: 'Create License',
      user: { username: req.session.username, role: req.session.userRole },
      products,
      customers,
      licenseTypes,
      error: 'Product, customer, and license type are required'
    });
  }

  // Get license type to calculate expiry date
  const licenseType = await LicenseType.findByName(type);
  if (!licenseType) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid license type'
      });
    }
    throw new Error('Invalid license type');
  }

  // Calculate expiry date
  let expiryDate;
  if (custom_expiry) {
    expiryDate = custom_expiry;
  } else {
    expiryDate = moment().add(licenseType.duration_days, 'days').format('YYYY-MM-DD HH:mm:ss');
  }

  // Create license
  const result = await License.create({
    product_id: parseInt(product_id),
    customer_id: parseInt(customer_id),
    type,
    expiry_date: expiryDate,
    max_activations: max_activations ? parseInt(max_activations) : 1
  });

  // Log the creation
  await ActivityLog.create({
    license_id: result.id,
    action: 'license_created',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  if (req.path.startsWith('/api/')) {
    return res.status(201).json({
      success: true,
      message: 'License created successfully',
      licenseId: result.id,
      licenseKey: result.license_key
    });
  }

  res.redirect('/licenses');
});

// Show edit license form
const showEditForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const license = await License.findById(id);

  if (!license) {
    throw new Error('License not found');
  }

  const licenseTypes = await LicenseType.findAll();

  res.render('licenses/edit', {
    title: `Edit License: ${license.license_key}`,
    user: { username: req.session.username, role: req.session.userRole },
    license,
    licenseTypes,
    error: null
  });
});

// Update license
const updateLicense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, expiry_date, status, max_activations } = req.body;

  if (!type || !expiry_date || !status) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Type, expiry date, and status are required'
      });
    }

    const license = await License.findById(id);
    const licenseTypes = await LicenseType.findAll();

    return res.render('licenses/edit', {
      title: `Edit License: ${license.license_key}`,
      user: { username: req.session.username, role: req.session.userRole },
      license,
      licenseTypes,
      error: 'Type, expiry date, and status are required'
    });
  }

  const updated = await License.update(id, {
    type,
    expiry_date,
    status,
    max_activations: max_activations ? parseInt(max_activations) : 1
  });

  if (!updated) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    throw new Error('License not found');
  }

  // Log the update
  await ActivityLog.create({
    license_id: id,
    action: 'license_updated',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'License updated successfully'
    });
  }

  res.redirect('/licenses');
});

// Delete license
const deleteLicense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await License.delete(id);

  if (!deleted) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    throw new Error('License not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'License deleted successfully'
    });
  }

  res.redirect('/licenses');
});

// Validate license (API only)
const validateLicense = asyncHandler(async (req, res) => {
  const { license_key } = req.body;

  if (!license_key) {
    return res.status(400).json({
      success: false,
      message: 'License key is required'
    });
  }

  const validation = await License.validate(license_key);

  // Log the validation attempt
  if (validation.license) {
    await ActivityLog.create({
      license_id: validation.license.id,
      action: validation.valid ? 'validation_success' : 'validation_failed',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });
  }

  res.json(validation);
});

// Activate license (API only)
const activateLicense = asyncHandler(async (req, res) => {
  const { license_key } = req.body;

  if (!license_key) {
    return res.status(400).json({
      success: false,
      message: 'License key is required'
    });
  }

  // First validate the license
  const validation = await License.validate(license_key);

  if (!validation.valid) {
    // Log failed activation
    if (validation.license) {
      await ActivityLog.create({
        license_id: validation.license.id,
        action: 'activation_failed',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });
    }

    return res.status(400).json(validation);
  }

  // Increment activation count
  const activated = await License.incrementActivations(validation.license.id);

  if (!activated) {
    await ActivityLog.create({
      license_id: validation.license.id,
      action: 'activation_failed',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    return res.status(400).json({
      success: false,
      message: 'Maximum activations reached'
    });
  }

  // Log successful activation
  await ActivityLog.create({
    license_id: validation.license.id,
    action: 'activation_success',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  res.json({
    success: true,
    message: 'License activated successfully',
    license: validation.license
  });
});

// Deactivate license (API only)
const deactivateLicense = asyncHandler(async (req, res) => {
  const { license_key } = req.body;

  if (!license_key) {
    return res.status(400).json({
      success: false,
      message: 'License key is required'
    });
  }

  const license = await License.findByKey(license_key);

  if (!license) {
    return res.status(404).json({
      success: false,
      message: 'License not found'
    });
  }

  const deactivated = await License.decrementActivations(license.id);

  if (!deactivated) {
    await ActivityLog.create({
      license_id: license.id,
      action: 'deactivation_failed',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    return res.status(400).json({
      success: false,
      message: 'No active activations to deactivate'
    });
  }

  // Log successful deactivation
  await ActivityLog.create({
    license_id: license.id,
    action: 'deactivation_success',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  res.json({
    success: true,
    message: 'License deactivated successfully'
  });
});

// Suspend/Revoke license
const suspendLicense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await License.updateStatus(id, 'suspended');

  if (!updated) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    throw new Error('License not found');
  }

  // Log the suspension
  await ActivityLog.create({
    license_id: id,
    action: 'license_suspended',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'License suspended successfully'
    });
  }

  res.redirect('/licenses');
});

// Reactivate license
const reactivateLicense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await License.updateStatus(id, 'active');

  if (!updated) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    throw new Error('License not found');
  }

  // Log the reactivation
  await ActivityLog.create({
    license_id: id,
    action: 'license_reactivated',
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'License reactivated successfully'
    });
  }

  res.redirect('/licenses');
});

module.exports = {
  getAllLicenses,
  getLicense,
  showCreateForm,
  createLicense,
  showEditForm,
  updateLicense,
  deleteLicense,
  validateLicense,
  activateLicense,
  deactivateLicense,
  suspendLicense,
  reactivateLicense
};
