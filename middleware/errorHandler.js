// 404 Error Handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  // For API requests, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // For web requests, render error page or send simple message
  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error ${statusCode}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 100px auto;
          padding: 20px;
          text-align: center;
        }
        h1 { color: #dc3545; }
        .error-code { font-size: 72px; font-weight: bold; color: #6c757d; }
        .message { font-size: 18px; margin: 20px 0; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="error-code">${statusCode}</div>
      <h1>${statusCode === 404 ? 'Page Not Found' : 'Error Occurred'}</h1>
      <p class="message">${err.message}</p>
      ${process.env.NODE_ENV === 'development' && err.stack ? `<pre style="text-align: left; background: #f5f5f5; padding: 20px; border-radius: 5px;">${err.stack}</pre>` : ''}
      <p><a href="/">Go to Home</a> | <a href="/dashboard">Go to Dashboard</a></p>
    </body>
    </html>
  `);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};
