# License Management System

A comprehensive license management application built with Node.js, Express, SQLite, and EJS.

## Features (Planned)

- User authentication and authorization
- License generation and management
- Dashboard for license overview
- License validation and tracking
- Bootstrap-based responsive UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Template Engine**: EJS
- **Frontend**: Bootstrap 5
- **Authentication**: bcrypt, JWT
- **Session Management**: express-session

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   - Copy `.env` and update the values as needed
   - Change `SESSION_SECRET` and `JWT_SECRET` to random strings

4. Initialize the database:
   ```bash
   pnpm run init-db
   ```
   This will create:
   - All database tables (products, customers, licenses, license_types, activity_logs, users)
   - Default license types (Trial, Monthly, Yearly, Lifetime)
   - Default admin user (username: `admin`, password: `admin123`)

5. Verify database setup (optional):
   ```bash
   pnpm run verify-db
   ```

6. Start the server:
   ```bash
   pnpm start
   ```

7. Access the application at `http://localhost:3000`

## Project Structure

```
dashboard-license-management/
├── config/          # Configuration files
│   ├── database.js  # Database connection and wrapper
│   └── schema.js    # Database schema and initialization
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
│   ├── Product.js   # Product model
│   ├── Customer.js  # Customer model
│   ├── License.js   # License model
│   ├── LicenseType.js # License type model
│   ├── ActivityLog.js # Activity log model
│   ├── User.js      # User model
│   └── index.js     # Model exports
├── public/          # Static files (CSS, JS, images)
├── routes/          # Route definitions
├── scripts/         # Utility scripts
│   ├── init-db.js   # Database initialization
│   └── verify-db.js # Database verification
├── views/           # EJS templates
├── .env             # Environment variables
├── server.js        # Application entry point
└── package.json     # Project dependencies
```

## Database Schema

The application uses SQLite with the following tables:

- **products**: Product catalog with name, description, version, and price
- **customers**: Customer information including contact details
- **licenses**: License records with keys, expiry dates, and activation limits
- **license_types**: License type definitions (Trial, Monthly, Yearly, Lifetime)
- **activity_logs**: Audit trail for license usage and actions
- **users**: Admin users for system management

## Development

**Completed:**
- ✅ Basic project setup with pnpm
- ✅ Express server with EJS templating
- ✅ SQLite database configuration
- ✅ Database schema and models
- ✅ Default license types and admin user

**Next Steps:**
- Authentication system
- License generation logic
- Frontend with Bootstrap
- API endpoints

## License

ISC
