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

4. Start the server:
   ```bash
   pnpm start
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
dashboard-license-management/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── public/          # Static files (CSS, JS, images)
├── routes/          # Route definitions
├── views/           # EJS templates
├── .env             # Environment variables
├── server.js        # Application entry point
└── package.json     # Project dependencies
```

## Development

Currently in development. Basic setup is complete.

## License

ISC
