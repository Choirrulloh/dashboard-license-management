const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Render login page
const showLoginPage = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    error: null
  });
};

// Render register page
const showRegisterPage = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    error: null
  });
};

// Handle login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    return res.render('auth/login', {
      title: 'Login',
      error: 'Username and password are required'
    });
  }

  const result = await User.authenticate(username, password);

  if (!result.success) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json(result);
    }
    return res.render('auth/login', {
      title: 'Login',
      error: result.message
    });
  }

  // Set session
  req.session.userId = result.user.id;
  req.session.username = result.user.username;
  req.session.userRole = result.user.role;

  // For API requests, return token
  if (req.path.startsWith('/api/')) {
    const token = jwt.sign(
      { id: result.user.id, username: result.user.username, role: result.user.role },
      process.env.JWT_SECRET || 'change-this-jwt-secret-key-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: result.user
    });
  }

  // For web requests, redirect to dashboard
  res.redirect('/dashboard');
});

// Handle logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }

    if (req.path.startsWith('/api/')) {
      return res.json({
        success: true,
        message: 'Logout successful'
      });
    }

    res.redirect('/auth/login');
  });
};

// Handle registration
const register = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    return res.render('auth/register', {
      title: 'Register',
      error: 'All fields are required'
    });
  }

  if (password !== confirmPassword) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    return res.render('auth/register', {
      title: 'Register',
      error: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    return res.render('auth/register', {
      title: 'Register',
      error: 'Password must be at least 6 characters'
    });
  }

  // Check if user already exists
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    return res.render('auth/register', {
      title: 'Register',
      error: 'Username already exists'
    });
  }

  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    return res.render('auth/register', {
      title: 'Register',
      error: 'Email already exists'
    });
  }

  // Create user
  const userId = await User.create({
    username,
    email,
    password,
    role: 'user' // Default role
  });

  if (req.path.startsWith('/api/')) {
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId
    });
  }

  res.redirect('/auth/login');
});

// Get current user info
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.session.userId || req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user
  });
});

module.exports = {
  showLoginPage,
  showRegisterPage,
  login,
  logout,
  register,
  getCurrentUser
};
