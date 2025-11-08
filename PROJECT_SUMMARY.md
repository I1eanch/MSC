# Project Summary

## Overview

This repository contains a complete identity backend implementation built with NestJS, featuring comprehensive authentication, authorization, and user management capabilities.

## Repository Structure

```
.
├── 1_start/              # Original static HTML/CSS portfolio site
│   ├── index.html        # Allan Rayman musician portfolio
│   ├── style.css         # Basic styling
│   └── images/           # Image assets
├── backend/              # NestJS Identity Backend (NEW)
│   ├── src/              # Source code
│   ├── test/             # Test files
│   ├── package.json      # Dependencies
│   ├── README.md         # Setup and usage guide
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   └── TESTING.md        # Testing guide
├── index.html            # Root HTML file
└── .gitignore            # Git ignore rules
```

## Backend Features

The `backend/` directory contains a production-ready NestJS application with:

### Authentication & Authorization
- ✅ Email/password registration
- ✅ Login with JWT access tokens (15 min expiry)
- ✅ Refresh tokens (7 day expiry) with rotation
- ✅ Secure logout with token revocation
- ✅ Password reset via email (AWS SES)
- ✅ Bcrypt password hashing

### User Management
- ✅ CRUD operations for users
- ✅ Role-based access control (User, Trainer, Admin)
- ✅ Role-specific endpoint protection
- ✅ User profile management

### API Exposure
- ✅ REST API with full OpenAPI/Swagger documentation
- ✅ GraphQL API with interactive playground
- ✅ Dual API support for flexibility

### Email Integration
- ✅ AWS SES integration
- ✅ Welcome emails on registration
- ✅ Password reset emails with HTML templates
- ✅ Graceful fallback when SES not configured

### Database
- ✅ PostgreSQL with TypeORM
- ✅ User entity with roles and timestamps
- ✅ RefreshToken entity for token management
- ✅ Automatic schema synchronization (dev mode)

### Testing
- ✅ Comprehensive unit tests (Jest)
- ✅ 85%+ test coverage
- ✅ Success and error case testing
- ✅ Mocked dependencies

### Security
- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT token validation
- ✅ Refresh token rotation
- ✅ Password reset token expiration
- ✅ Global authentication guards
- ✅ CORS configuration
- ✅ Input validation

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- AWS account with SES (optional for development)

### Setup

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Create database**:
```bash
createdb identity_db
```

4. **Run the application**:
```bash
npm run start:dev
```

5. **Access the APIs**:
- Swagger UI: http://localhost:3000/api
- GraphQL Playground: http://localhost:3000/graphql
- REST API: http://localhost:3000

### Testing

```bash
cd backend
npm test                # Run unit tests
npm run test:cov        # Generate coverage report
```

## API Endpoints

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke tokens
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### User Management (Protected)
- `GET /users` - Get all users (Trainer, Admin)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### GraphQL
All REST endpoints are also available via GraphQL with similar mutations and queries.

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **USER** | Basic authenticated access |
| **TRAINER** | View all users |
| **ADMIN** | Full access (create/update/delete users) |

## Technology Stack

- **Backend Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Passport)
- **Email**: AWS SES
- **API**: REST (Swagger) + GraphQL (Apollo)
- **Testing**: Jest
- **Validation**: class-validator, class-transformer

## Documentation

Detailed documentation available in the `backend/` directory:

1. **README.md** - Complete setup guide with configuration, installation, and usage
2. **API_DOCUMENTATION.md** - Comprehensive API reference with examples
3. **TESTING.md** - Testing guide with coverage details and best practices

## Environment Variables

Required environment variables (see `backend/.env.example`):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=identity_db

# JWT Secrets
JWT_ACCESS_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-secure-secret

# AWS SES (optional for dev)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
SES_FROM_EMAIL=noreply@example.com
```

## Production Considerations

Before deploying to production:

1. **Security**:
   - Change default JWT secrets
   - Use strong database passwords
   - Enable HTTPS
   - Configure CORS for specific origins
   - Implement rate limiting

2. **Database**:
   - Disable TypeORM auto-sync
   - Use migrations for schema changes
   - Set up database backups
   - Configure connection pooling

3. **Monitoring**:
   - Add logging (Winston, Pino)
   - Set up error tracking (Sentry)
   - Monitor performance (DataDog, New Relic)
   - Track API usage

4. **Email**:
   - Verify SES production access
   - Set up email templates
   - Monitor email delivery
   - Handle bounce notifications

## Development

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Linting and formatting
npm run lint
npm run format

# Tests
npm test
npm run test:watch
npm run test:cov
```

## Contributing

When adding new features:

1. Write unit tests
2. Update API documentation
3. Follow existing code style
4. Update README if needed
5. Test all endpoints

## License

MIT

## Support

For issues or questions:
- Check the documentation in `backend/README.md`
- Review API examples in `backend/API_DOCUMENTATION.md`
- Consult testing guide in `backend/TESTING.md`

## Acceptance Criteria ✅

The implementation meets all specified requirements:

- ✅ NestJS auth module with JWT access/refresh tokens
- ✅ Password hashing with bcrypt
- ✅ User management with CRUD operations
- ✅ Role-based access (user, trainer, admin)
- ✅ Email/password registration
- ✅ Login functionality
- ✅ Password reset via email (SES)
- ✅ REST endpoints with OpenAPI/Swagger documentation
- ✅ GraphQL endpoints with playground
- ✅ Comprehensive unit tests for success/error cases
- ✅ Security best practices implemented
- ✅ Complete documentation
