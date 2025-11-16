const db = require('../config/database');

// Get dashboard overview statistics
exports.getDashboardStats = (req, res) => {
  try {
    // Total counts
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const totalLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses').get();

    // License status breakdown
    const activeLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE status = ?').get('active');
    const expiredLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE status = ?').get('expired');
    const revokedLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE status = ?').get('revoked');

    // Recent activity
    const recentLicenses = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `).all();

    const recentCustomers = db.prepare(`
      SELECT * FROM customers
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = db.prepare(`
      SELECT l.*,
             c.name as customer_name,
             p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.status = 'active'
        AND l.expiry_date IS NOT NULL
        AND l.expiry_date <= ?
      ORDER BY l.expiry_date ASC
      LIMIT 10
    `).all(thirtyDaysFromNow.toISOString().split('T')[0]);

    res.json({
      overview: {
        totalCustomers: totalCustomers.count,
        totalProducts: totalProducts.count,
        totalLicenses: totalLicenses.count,
        activeLicenses: activeLicenses.count,
        expiredLicenses: expiredLicenses.count,
        revokedLicenses: revokedLicenses.count
      },
      recentActivity: {
        licenses: recentLicenses,
        customers: recentCustomers
      },
      expiringSoon
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

// Get license statistics by date range
exports.getLicenseStatsByDateRange = (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const stats = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked
      FROM licenses
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(startDate, endDate);

    res.json(stats);
  } catch (error) {
    console.error('Get license stats by date range error:', error);
    res.status(500).json({ error: 'Failed to retrieve license statistics' });
  }
};

// Get product performance report
exports.getProductPerformance = (req, res) => {
  try {
    const productStats = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.version,
        COUNT(l.id) as total_licenses,
        SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_licenses,
        SUM(CASE WHEN l.status = 'expired' THEN 1 ELSE 0 END) as expired_licenses,
        SUM(CASE WHEN l.status = 'revoked' THEN 1 ELSE 0 END) as revoked_licenses,
        SUM(l.current_activations) as total_activations
      FROM products p
      LEFT JOIN licenses l ON p.id = l.product_id
      GROUP BY p.id, p.name, p.version
      ORDER BY total_licenses DESC
    `).all();

    res.json(productStats);
  } catch (error) {
    console.error('Get product performance error:', error);
    res.status(500).json({ error: 'Failed to retrieve product performance report' });
  }
};

// Get customer activity report
exports.getCustomerActivity = (req, res) => {
  try {
    const customerStats = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.company,
        COUNT(l.id) as total_licenses,
        SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_licenses,
        SUM(CASE WHEN l.status = 'expired' THEN 1 ELSE 0 END) as expired_licenses,
        SUM(CASE WHEN l.status = 'revoked' THEN 1 ELSE 0 END) as revoked_licenses,
        MAX(l.created_at) as last_license_date
      FROM customers c
      LEFT JOIN licenses l ON c.id = l.customer_id
      GROUP BY c.id, c.name, c.email, c.company
      ORDER BY total_licenses DESC
    `).all();

    res.json(customerStats);
  } catch (error) {
    console.error('Get customer activity error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer activity report' });
  }
};

// Get revenue report (if price is available)
exports.getRevenueReport = (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        DATE(l.created_at) as date,
        COUNT(l.id) as licenses_sold,
        SUM(COALESCE(p.price, 0)) as revenue,
        p.name as product_name
      FROM licenses l
      JOIN products p ON l.product_id = p.id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE DATE(l.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY DATE(l.created_at), p.name
      ORDER BY date DESC
    `;

    const revenueData = db.prepare(query).all(...params);

    // Calculate totals
    const totals = db.prepare(`
      SELECT
        COUNT(l.id) as total_licenses,
        SUM(COALESCE(p.price, 0)) as total_revenue
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      ${startDate && endDate ? 'WHERE DATE(l.created_at) BETWEEN ? AND ?' : ''}
    `).get(...params);

    res.json({
      data: revenueData,
      totals
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({ error: 'Failed to retrieve revenue report' });
  }
};

// Get expiring licenses report
exports.getExpiringLicenses = (req, res) => {
  try {
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringLicenses = db.prepare(`
      SELECT
        l.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company as customer_company,
        p.name as product_name,
        p.version as product_version,
        julianday(l.expiry_date) - julianday('now') as days_until_expiry
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.status = 'active'
        AND l.expiry_date IS NOT NULL
        AND l.expiry_date <= ?
      ORDER BY l.expiry_date ASC
    `).all(futureDate.toISOString().split('T')[0]);

    res.json({
      count: expiringLicenses.length,
      licenses: expiringLicenses
    });
  } catch (error) {
    console.error('Get expiring licenses error:', error);
    res.status(500).json({ error: 'Failed to retrieve expiring licenses report' });
  }
};

// Get license type distribution
exports.getLicenseTypeDistribution = (req, res) => {
  try {
    const distribution = db.prepare(`
      SELECT
        license_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM licenses
      GROUP BY license_type
    `).all();

    res.json(distribution);
  } catch (error) {
    console.error('Get license type distribution error:', error);
    res.status(500).json({ error: 'Failed to retrieve license type distribution' });
  }
};

// Get monthly growth report
exports.getMonthlyGrowth = (req, res) => {
  try {
    const monthlyStats = db.prepare(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as new_licenses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_licenses
      FROM licenses
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    const monthlyCustomers = db.prepare(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as new_customers
      FROM customers
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    res.json({
      licenses: monthlyStats,
      customers: monthlyCustomers
    });
  } catch (error) {
    console.error('Get monthly growth error:', error);
    res.status(500).json({ error: 'Failed to retrieve monthly growth report' });
  }
};

// Get activation statistics
exports.getActivationStats = (req, res) => {
  try {
    const activationStats = db.prepare(`
      SELECT
        COUNT(*) as total_licenses,
        SUM(current_activations) as total_activations,
        AVG(current_activations) as avg_activations,
        SUM(CASE WHEN max_activations IS NOT NULL
                 AND current_activations >= max_activations
                 THEN 1 ELSE 0 END) as fully_activated
      FROM licenses
      WHERE status = 'active'
    `).get();

    const topActivated = db.prepare(`
      SELECT
        l.license_key,
        l.current_activations,
        l.max_activations,
        c.name as customer_name,
        p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.status = 'active'
      ORDER BY l.current_activations DESC
      LIMIT 10
    `).all();

    res.json({
      stats: activationStats,
      topActivated
    });
  } catch (error) {
    console.error('Get activation stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve activation statistics' });
  }
};
