const { Customer } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all customers
const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.findAll();

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      count: customers.length,
      customers
    });
  }

  res.render('customers/index', {
    title: 'Customers',
    user: { username: req.session.username, role: req.session.userRole },
    customers
  });
});

// Get single customer
const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findById(id);

  if (!customer) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    throw new Error('Customer not found');
  }

  // Get customer's licenses
  const licenses = await Customer.getLicenses(id);

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      customer: {
        ...customer,
        licenses
      }
    });
  }

  res.render('customers/view', {
    title: `Customer: ${customer.name}`,
    user: { username: req.session.username, role: req.session.userRole },
    customer,
    licenses
  });
});

// Show create customer form
const showCreateForm = (req, res) => {
  res.render('customers/create', {
    title: 'Create Customer',
    user: { username: req.session.username, role: req.session.userRole },
    error: null
  });
};

// Create customer
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, company, phone, address } = req.body;

  if (!name || !email) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    return res.render('customers/create', {
      title: 'Create Customer',
      user: { username: req.session.username, role: req.session.userRole },
      error: 'Name and email are required'
    });
  }

  // Check if email already exists
  const existingCustomer = await Customer.findByEmail(email);
  if (existingCustomer) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    return res.render('customers/create', {
      title: 'Create Customer',
      user: { username: req.session.username, role: req.session.userRole },
      error: 'Email already exists'
    });
  }

  const customerId = await Customer.create({
    name,
    email,
    company: company || '',
    phone: phone || '',
    address: address || ''
  });

  if (req.path.startsWith('/api/')) {
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customerId
    });
  }

  res.redirect('/customers');
});

// Show edit customer form
const showEditForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findById(id);

  if (!customer) {
    throw new Error('Customer not found');
  }

  res.render('customers/edit', {
    title: `Edit Customer: ${customer.name}`,
    user: { username: req.session.username, role: req.session.userRole },
    customer,
    error: null
  });
});

// Update customer
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, company, phone, address } = req.body;

  if (!name || !email) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    const customer = await Customer.findById(id);
    return res.render('customers/edit', {
      title: `Edit Customer: ${customer.name}`,
      user: { username: req.session.username, role: req.session.userRole },
      customer,
      error: 'Name and email are required'
    });
  }

  // Check if email is being changed and already exists
  const existingCustomer = await Customer.findById(id);
  if (existingCustomer.email !== email) {
    const emailExists = await Customer.findByEmail(email);
    if (emailExists) {
      if (req.path.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      return res.render('customers/edit', {
        title: `Edit Customer: ${existingCustomer.name}`,
        user: { username: req.session.username, role: req.session.userRole },
        customer: existingCustomer,
        error: 'Email already exists'
      });
    }
  }

  const updated = await Customer.update(id, {
    name,
    email,
    company: company || '',
    phone: phone || '',
    address: address || ''
  });

  if (!updated) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    throw new Error('Customer not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'Customer updated successfully'
    });
  }

  res.redirect('/customers');
});

// Delete customer
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Customer.delete(id);

  if (!deleted) {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    throw new Error('Customer not found');
  }

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  }

  res.redirect('/customers');
});

// Search customers
const searchCustomers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.redirect('/customers');
  }

  const customers = await Customer.search(q);

  if (req.path.startsWith('/api/')) {
    return res.json({
      success: true,
      count: customers.length,
      customers
    });
  }

  res.render('customers/index', {
    title: 'Customers - Search Results',
    user: { username: req.session.username, role: req.session.userRole },
    customers,
    searchQuery: q
  });
});

module.exports = {
  getAllCustomers,
  getCustomer,
  showCreateForm,
  createCustomer,
  showEditForm,
  updateCustomer,
  deleteCustomer,
  searchCustomers
};
