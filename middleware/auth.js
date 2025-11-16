const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated via session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  // For API requests, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // For web requests, redirect to login
  res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  res.status(403).send('Admin access required');
};

// Middleware to verify JWT token for API requests
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-jwt-secret-key-in-production');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is already logged in
const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  verifyToken,
  isGuest
};
