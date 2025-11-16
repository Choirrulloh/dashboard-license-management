const cron = require('node-cron');
const database = require('./database');
const { License } = require('../models');

// Daily cron job to check and update expired licenses
const checkExpiredLicenses = async () => {
  try {
    console.log('[CRON] Running expired licenses check...');

    // Find all active licenses that have expired
    const sql = `
      UPDATE licenses
      SET status = 'expired'
      WHERE status = 'active'
        AND expiry_date < datetime('now')
    `;

    const result = await database.run(sql);

    if (result.changes > 0) {
      console.log(`[CRON] Updated ${result.changes} expired license(s)`);
    } else {
      console.log('[CRON] No expired licenses found');
    }

    // Get licenses expiring in the next 7 days for notification purposes
    const expiringLicenses = await License.getExpiringLicenses(7);

    if (expiringLicenses.length > 0) {
      console.log(`[CRON] ${expiringLicenses.length} license(s) expiring in the next 7 days:`);
      expiringLicenses.forEach(license => {
        console.log(`  - ${license.license_key} (${license.customer_name}) expires: ${license.expiry_date}`);
      });
      // Here you could send email notifications to customers
    }

    console.log('[CRON] Expired licenses check completed');
  } catch (error) {
    console.error('[CRON] Error checking expired licenses:', error);
  }
};

// Initialize cron jobs
const initCronJobs = () => {
  // Run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', checkExpiredLicenses, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('✓ Cron jobs initialized (Daily license expiry check at midnight UTC)');

  // Run once on startup to check for any expired licenses
  setTimeout(checkExpiredLicenses, 5000); // Wait 5 seconds after startup
};

module.exports = {
  initCronJobs,
  checkExpiredLicenses
};
