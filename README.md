# License Management System

A comprehensive license management dashboard built with Express.js and SQLite. This MVP (Phase 1) provides a REST API for managing software licenses, customers, products, and user authentication.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Customer Management**: Full CRUD operations for managing customers
- **Product Management**: Product versioning, pricing, and license type configuration
- **License Management**: License creation, validation, activation/deactivation, and revocation
- **Dashboard Analytics**: Statistics, reports, and monitoring endpoints
- **Role-Based Access Control**: Admin and user roles with granular permissions
- **SQLite Database**: Lightweight, file-based database with automatic schema migration

## Tech Stack

- **Runtime**: Node.js v22+
- **Framework**: Express.js 4.18.2
- **Database**: SQLite 3 with better-sqlite3 12.4.1
- **Authentication**: JWT (jsonwebtoken 9.0.0) with bcryptjs
- **Validation**: express-validator 7.0.0
- **Logging**: Winston 3.8.2
- **Package Manager**: pnpm 8.0.0 (configured, npm also supported)

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (recommended) or npm 8+
- 100MB disk space for database and logs

## Installation

### Quick Start (Automated)

The easiest way to get started is using the automated installer script:

**On macOS/Linux**
```bash
chmod +x install.sh
./install.sh
```

**On Windows**
```bash
install.bat
```

The installer will:
- ✓ Check Node.js installation
- ✓ Detect and use pnpm or npm
- ✓ Install all dependencies
- ✓ Create `.env` configuration file
- ✓ Initialize the SQLite database
- ✓ Show you next steps

### Manual Installation

If you prefer to install manually:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-license-management
   ```

2. **Install dependencies**

   **Using pnpm (recommended)**
   ```bash
   pnpm install
   ```

   **Using npm**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   LOG_LEVEL=info
   ```

4. **Run database migration**
   ```bash
   pnpm migrate
   # or
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Development (with auto-reload)
   pnpm dev
   # or
   npm run dev

   # Production
   pnpm start
   # or
   npm start
   ```

The server will start on `http://localhost:3000`

## Project Structure

```
dashboard-license-management/
├── config/                 # Configuration files
│   ├── database.js        # SQLite connection setup
│   ├── logger.js          # Winston logger configuration
│   └── schema.sql         # Database schema and tables
├── controllers/           # Business logic
│   ├── authController.js       # User authentication
│   ├── customerController.js   # Customer operations
│   ├── productController.js    # Product operations
│   ├── licenseController.js    # License operations
│   └── dashboardController.js  # Analytics and reports
├── middleware/            # Express middleware
│   ├── auth.js           # JWT authentication
│   └── errorHandler.js   # Global error handling
├── routes/               # API route definitions
│   ├── auth.js           # Authentication endpoints
│   ├── customers.js      # Customer endpoints
│   ├── products.js       # Product endpoints
│   ├── licenses.js       # License endpoints
│   └── dashboard.js      # Dashboard endpoints
├── scripts/              # Utility scripts
│   └── migrate.js        # Database migration script
├── data/                 # SQLite database files
├── logs/                 # Application logs
├── server.js             # Main application entry point
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables (not in git)
```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "admin"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "created_at": "2025-11-16 14:05:07"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid-string",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "status": "active",
  "created_at": "2025-11-16 14:05:07",
  "updated_at": "2025-11-16 14:05:07"
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

Response: 200 OK
```

#### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}

Response: 200 OK
```

### Customers (`/api/customers`)

#### Create Customer
```
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "company": "Acme Corporation",
  "phone": "+1-555-0123",
  "address": "123 Business St",
  "notes": "Important client"
}

Response: 201 Created
```

#### Get All Customers
```
GET /api/customers?page=1&limit=10&search=acme
Authorization: Bearer <token>

Response: 200 OK
{
  "customers": [...],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

#### Get Customer by ID
```
GET /api/customers/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update Customer
```
PUT /api/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

Response: 200 OK
```

#### Delete Customer
```
DELETE /api/customers/:id
Authorization: Bearer <token>

Response: 200 OK
```

### Products (`/api/products`)

#### Create Product
```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Software Pro",
  "version": "1.0.0",
  "description": "Professional edition",
  "price": 299.99,
  "license_type": "perpetual",
  "is_active": true
}

Response: 201 Created
```

#### Get All Products
```
GET /api/products?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
```

#### Get Product by ID
```
GET /api/products/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update Product
```
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

Response: 200 OK
```

#### Delete Product
```
DELETE /api/products/:id
Authorization: Bearer <token>

Response: 200 OK
```

### Licenses (`/api/licenses`)

#### Create License
```
POST /api/licenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "product_id": 1,
  "license_type": "perpetual",
  "max_activations": 5,
  "expiry_date": "2026-11-16",
  "notes": "Initial purchase"
}

Response: 201 Created
```

#### Validate License (Public)
```
POST /api/licenses/validate
Content-Type: application/json

{
  "license_key": "LICENSE-KEY-HERE"
}

Response: 200 OK
{
  "valid": true,
  "license": {...}
}
```

#### Activate License (Public)
```
POST /api/licenses/activate
Content-Type: application/json

{
  "license_key": "LICENSE-KEY-HERE"
}

Response: 200 OK
```

#### Get All Licenses
```
GET /api/licenses?page=1&limit=10&status=active
Authorization: Bearer <token>

Response: 200 OK
```

#### Get License by ID
```
GET /api/licenses/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update License
```
PUT /api/licenses/:id
Authorization: Bearer <token>
Content-Type: application/json

Response: 200 OK
```

#### Revoke License
```
POST /api/licenses/:id/revoke
Authorization: Bearer <token>

Response: 200 OK
```

### Dashboard (`/api/dashboard`)

#### Get Overview
```
GET /api/dashboard/overview
Authorization: Bearer <token>

Response: 200 OK
{
  "totalCustomers": 5,
  "totalProducts": 3,
  "totalLicenses": 15,
  "activeLicenses": 12
}
```

#### Get Reports
```
GET /api/dashboard/reports
Authorization: Bearer <token>

Response: 200 OK
```

### Health Check

```
GET /api/health

Response: 200 OK
{
  "status": "ok",
  "database": "connected"
}
```

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY) - UUID
- `email` (TEXT, UNIQUE, NOT NULL)
- `password` (TEXT, NOT NULL) - bcrypt hashed
- `name` (TEXT, NOT NULL)
- `role` (TEXT) - admin or user
- `status` (TEXT) - active or inactive
- `created_at` (TEXT) - ISO format timestamp
- `updated_at` (TEXT) - ISO format timestamp

### Customers Table
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE NOT NULL)
- `company` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `notes` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### Products Table
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT, NOT NULL)
- `version` (TEXT, NOT NULL)
- `description` (TEXT)
- `price` (REAL)
- `license_type` (TEXT) - perpetual, subscription, trial
- `is_active` (INTEGER) - 0 or 1
- `created_at` (TEXT)
- `updated_at` (TEXT)

### Licenses Table
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `license_key` (TEXT, UNIQUE NOT NULL)
- `customer_id` (INTEGER, FOREIGN KEY)
- `product_id` (INTEGER, FOREIGN KEY)
- `license_type` (TEXT)
- `status` (TEXT) - active, expired, revoked
- `max_activations` (INTEGER)
- `current_activations` (INTEGER)
- `expiry_date` (TEXT)
- `notes` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### Activity Logs Table
- `id` (TEXT, PRIMARY KEY) - UUID
- `user_id` (TEXT, FOREIGN KEY)
- `action_type` (TEXT)
- `entity_type` (TEXT)
- `entity_id` (TEXT)
- `changes` (TEXT) - JSON
- `ip_address` (TEXT)
- `created_at` (TEXT)

## Development

### Available Scripts

**Using pnpm (recommended)**
```bash
# Start development server with auto-reload
pnpm dev

# Start production server
pnpm start

# Run database migration
pnpm migrate

# Run tests (if implemented)
pnpm test

# Run tests with coverage (if implemented)
pnpm test --coverage
```

**Using npm**
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run database migration
npm run migrate

# Run tests (if implemented)
npm test

# Run tests with coverage (if implemented)
npm test -- --coverage
```

### Debug Mode

Set `LOG_LEVEL=debug` in `.env` for detailed logging:

```
LOG_LEVEL=debug
```

Logs are saved to:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **Password Hashing**: All passwords are bcrypt hashed with salt rounds of 10
5. **Rate Limiting**: Not implemented in Phase 1, consider adding for production
6. **Input Validation**: Use express-validator for all inputs
7. **SQL Injection**: Using parameterized queries with better-sqlite3
8. **Environment Variables**: Never commit `.env` files

## Testing

Testing framework not yet implemented. Recommendations:

- **Unit Tests**: Jest with supertest for API endpoints
- **Integration Tests**: Test database interactions
- **Load Testing**: Artillery or Apache JMeter

## Troubleshooting

### Database Migration Fails
```bash
# Remove old database and retry
rm -f data/license_management.db*
npm run migrate
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or change PORT in .env
PORT=3001 npm start
```

### JWT Token Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token hasn't expired (default: 7 days)
- Ensure token is sent in `Authorization: Bearer <token>` header

### Permission Denied Errors
- Verify user has correct role (admin for admin operations)
- Check middleware order in routes

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Submit pull request

## Next Steps (Phase 2)

- [ ] Add EJS frontend templates
- [ ] Implement rate limiting middleware
- [ ] Add request/response logging
- [ ] Create comprehensive test suite
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement email notifications
- [ ] Add backup/restore functionality
- [ ] Create admin dashboard UI
- [ ] Implement audit trail with detailed logging
- [ ] Add webhook support for license events

## License

ISC

## Support

For issues and questions, please create an issue in the repository.

## Version

**1.0.0** - MVP Phase 1
- Initial release with core functionality
- User authentication
- Customer, Product, and License management
- Role-based access control
- Basic analytics and reporting

---

Last Updated: November 16, 2025
