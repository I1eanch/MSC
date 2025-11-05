# Identity Backend

A comprehensive NestJS authentication backend with JWT access/refresh tokens, password hashing, user management, and role-based access control (user, trainer, admin). Features email/password registration, login, and password reset via AWS SES.

## Features

- ✅ **Authentication**
  - Email/password registration
  - Login with JWT access and refresh tokens
  - Token refresh mechanism
  - Secure logout with token revocation
  - Password reset via email

- ✅ **Authorization**
  - Role-based access control (User, Trainer, Admin)
  - Protected routes with JWT guards
  - Role-specific endpoint access

- ✅ **Security**
  - Bcrypt password hashing
  - JWT token validation
  - Refresh token rotation
  - Password reset token expiration

- ✅ **Email Integration**
  - AWS SES integration
  - Welcome emails
  - Password reset emails with HTML templates

- ✅ **API Exposure**
  - REST API endpoints
  - GraphQL API
  - OpenAPI/Swagger documentation

- ✅ **Database**
  - PostgreSQL with TypeORM
  - User entity with roles
  - Refresh token management

- ✅ **Testing**
  - Comprehensive unit tests
  - Success and error case coverage

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- AWS account with SES configured (optional for development)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the environment variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=identity_db

# JWT Secrets (change in production!)
JWT_ACCESS_SECRET=your-secure-access-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
SES_FROM_EMAIL=noreply@example.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Database Setup

Create the PostgreSQL database:

```bash
createdb identity_db
```

The application will automatically synchronize database schema on startup (development mode).

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api
- GraphQL Playground: http://localhost:3000/graphql

## Running Tests

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## API Documentation

### REST API

Visit http://localhost:3000/api for interactive Swagger documentation.

#### Authentication Endpoints

**Register**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Refresh Token**
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

**Logout**
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Request Password Reset**
```http
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Reset Password**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewStrongPassword123!"
}
```

#### User Management Endpoints

**Get All Users** (Admin, Trainer)
```http
GET /users
Authorization: Bearer <access_token>
```

**Get User by ID**
```http
GET /users/:id
Authorization: Bearer <access_token>
```

**Create User** (Admin only)
```http
POST /users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "StrongPassword123!",
  "role": "user"
}
```

**Update User** (Admin only)
```http
PATCH /users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "trainer"
}
```

**Delete User** (Admin only)
```http
DELETE /users/:id
Authorization: Bearer <access_token>
```

### GraphQL API

Visit http://localhost:3000/graphql for interactive GraphQL Playground.

#### Sample Queries

**Register**
```graphql
mutation Register {
  register(registerDto: {
    email: "user@example.com"
    password: "StrongPassword123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      role
      createdAt
    }
  }
}
```

**Login**
```graphql
mutation Login {
  login(loginDto: {
    email: "user@example.com"
    password: "StrongPassword123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      role
    }
  }
}
```

**Get Users**
```graphql
query GetUsers {
  users {
    id
    email
    role
    createdAt
    updatedAt
  }
}
```

**Request Password Reset**
```graphql
mutation RequestPasswordReset {
  requestPasswordReset(requestPasswordResetDto: {
    email: "user@example.com"
  })
}
```

## Role-Based Access Control

### Roles

- **USER**: Default role for registered users
- **TRAINER**: Can view all users
- **ADMIN**: Full access to all endpoints

### Access Matrix

| Endpoint | USER | TRAINER | ADMIN |
|----------|------|---------|-------|
| Register | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Refresh Token | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| Password Reset | ✅ | ✅ | ✅ |
| Get All Users | ❌ | ✅ | ✅ |
| Get User by ID | ✅ | ✅ | ✅ |
| Create User | ❌ | ❌ | ✅ |
| Update User | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |

## Security Best Practices

1. **JWT Secrets**: Change default JWT secrets in production
2. **Password Policy**: Minimum 8 characters enforced
3. **Token Expiration**: Access tokens expire in 15 minutes
4. **Refresh Tokens**: Automatically rotated on refresh
5. **Password Hashing**: Bcrypt with salt rounds = 10
6. **CORS**: Configure allowed origins in production
7. **Rate Limiting**: Consider adding rate limiting middleware
8. **HTTPS**: Always use HTTPS in production

## Project Structure

```
backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── dto/                 # Data transfer objects
│   │   ├── strategies/          # Passport JWT strategies
│   │   ├── auth.controller.ts   # REST endpoints
│   │   ├── auth.resolver.ts     # GraphQL resolvers
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── auth.service.spec.ts # Unit tests
│   │   └── auth.module.ts
│   ├── users/                   # User management module
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.resolver.ts
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts
│   │   └── users.module.ts
│   ├── email/                   # Email service (SES)
│   │   ├── email.service.ts
│   │   └── email.module.ts
│   ├── common/                  # Shared resources
│   │   ├── decorators/          # Custom decorators
│   │   ├── guards/              # Authentication guards
│   │   └── interfaces/          # TypeScript interfaces
│   ├── config/                  # Configuration
│   │   └── configuration.ts
│   ├── database/                # Database entities
│   │   └── entities/
│   │       ├── user.entity.ts
│   │       └── refresh-token.entity.ts
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
├── test/                        # E2E tests
├── .env.example                 # Environment template
├── nest-cli.json                # NestJS configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run in debug mode
npm run start:debug
```

## License

MIT
