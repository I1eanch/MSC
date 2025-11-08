# API Documentation

Complete API documentation for the Identity Backend authentication system.

## Base URL

- **Development**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **GraphQL Playground**: `http://localhost:3000/graphql`

## Authentication

Most endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## REST API Endpoints

### Authentication Endpoints

#### 1. Register New User

**Endpoint**: `POST /auth/register`

**Description**: Register a new user with email and password.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Success Response** (201 Created):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input (e.g., weak password, invalid email)
- `409 Conflict`: User with this email already exists

---

#### 2. Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user with email and password.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Success Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials

---

#### 3. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Description**: Obtain a new access token using a valid refresh token.

**Authentication**: Refresh Token (Bearer)

**Headers**:
```
Authorization: Bearer <refresh_token>
```

**Success Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

#### 4. Logout

**Endpoint**: `POST /auth/logout`

**Description**: Revoke all refresh tokens for the authenticated user.

**Authentication**: Access Token (Bearer)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token

---

#### 5. Request Password Reset

**Endpoint**: `POST /auth/request-password-reset`

**Description**: Send password reset email to the user.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note**: For security, this endpoint always returns success even if the email doesn't exist.

---

#### 6. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Reset password using the token received via email.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewStrongPassword123!"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successful"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token

---

### User Management Endpoints

#### 7. Get All Users

**Endpoint**: `GET /users`

**Description**: Retrieve all users (Admin and Trainer only).

**Authentication**: Access Token (Bearer)

**Required Roles**: `admin`, `trainer`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions

---

#### 8. Get User by ID

**Endpoint**: `GET /users/:id`

**Description**: Retrieve a specific user by their ID.

**Authentication**: Access Token (Bearer)

**Parameters**:
- `id` (path, UUID): User ID

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token
- `404 Not Found`: User not found

---

#### 9. Create User

**Endpoint**: `POST /users`

**Description**: Create a new user (Admin only).

**Authentication**: Access Token (Bearer)

**Required Roles**: `admin`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "StrongPassword123!",
  "role": "trainer"
}
```

**Success Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "email": "newuser@example.com",
  "role": "trainer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: User already exists

---

#### 10. Update User

**Endpoint**: `PATCH /users/:id`

**Description**: Update user role (Admin only).

**Authentication**: Access Token (Bearer)

**Required Roles**: `admin`

**Parameters**:
- `id` (path, UUID): User ID

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "role": "trainer"
}
```

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "role": "trainer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

#### 11. Delete User

**Endpoint**: `DELETE /users/:id`

**Description**: Delete a user (Admin only).

**Authentication**: Access Token (Bearer)

**Required Roles**: `admin`

**Parameters**:
- `id` (path, UUID): User ID

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

## GraphQL API

### Authentication Mutations

#### Register

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
      updatedAt
    }
  }
}
```

#### Login

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
      createdAt
      updatedAt
    }
  }
}
```

#### Refresh Token

**Note**: Requires refresh token in HTTP Authorization header.

```graphql
mutation Refresh {
  refresh {
    accessToken
    refreshToken
  }
}
```

**HTTP Headers**:
```json
{
  "Authorization": "Bearer <refresh_token>"
}
```

#### Logout

**Note**: Requires access token in HTTP Authorization header.

```graphql
mutation Logout {
  logout
}
```

**HTTP Headers**:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Request Password Reset

```graphql
mutation RequestPasswordReset {
  requestPasswordReset(requestPasswordResetDto: {
    email: "user@example.com"
  })
}
```

#### Reset Password

```graphql
mutation ResetPassword {
  resetPassword(resetPasswordDto: {
    token: "a1b2c3d4e5f6..."
    newPassword: "NewStrongPassword123!"
  })
}
```

---

### User Queries and Mutations

#### Get All Users

**Note**: Requires access token. Admin or Trainer roles only.

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

**HTTP Headers**:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Get User by ID

**Note**: Requires access token.

```graphql
query GetUser {
  user(id: "123e4567-e89b-12d3-a456-426614174000") {
    id
    email
    role
    createdAt
    updatedAt
  }
}
```

#### Create User

**Note**: Requires access token. Admin role only.

```graphql
mutation CreateUser {
  createUser(createUserDto: {
    email: "newuser@example.com"
    password: "StrongPassword123!"
    role: USER
  }) {
    id
    email
    role
    createdAt
    updatedAt
  }
}
```

#### Update User

**Note**: Requires access token. Admin role only.

```graphql
mutation UpdateUser {
  updateUser(
    id: "123e4567-e89b-12d3-a456-426614174000"
    updateUserDto: {
      role: TRAINER
    }
  ) {
    id
    email
    role
    updatedAt
  }
}
```

#### Delete User

**Note**: Requires access token. Admin role only.

```graphql
mutation RemoveUser {
  removeUser(id: "123e4567-e89b-12d3-a456-426614174000")
}
```

---

## Data Models

### User

```typescript
{
  id: string;           // UUID
  email: string;        // Unique email address
  role: UserRole;       // 'user' | 'trainer' | 'admin'
  createdAt: Date;      // Account creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### UserRole Enum

- `user`: Default role with basic access
- `trainer`: Can view all users
- `admin`: Full access to all operations

### AuthResponse

```typescript
{
  accessToken: string;   // JWT access token (15 min expiry)
  refreshToken: string;  // JWT refresh token (7 day expiry)
  user: User;           // User object
}
```

### RefreshTokenResponse

```typescript
{
  accessToken: string;   // New JWT access token
  refreshToken: string;  // New JWT refresh token
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Token Management

### Access Token
- **Expiry**: 15 minutes
- **Usage**: All protected endpoints
- **Payload**: User ID, email, role

### Refresh Token
- **Expiry**: 7 days
- **Usage**: Refresh endpoint only
- **Rotation**: New token issued on each refresh
- **Revocation**: All tokens revoked on logout or password change

---

## Security Considerations

1. **Password Requirements**:
   - Minimum 8 characters
   - Should include uppercase, lowercase, numbers, and special characters

2. **Token Storage**:
   - Store access tokens in memory
   - Store refresh tokens in httpOnly cookies or secure storage

3. **Password Reset**:
   - Tokens expire in 1 hour
   - One-time use only
   - All sessions invalidated after password reset

4. **Rate Limiting**:
   - Consider implementing rate limiting for authentication endpoints
   - Recommended: 5 attempts per 15 minutes for login

5. **CORS**:
   - Configure allowed origins in production
   - Enable credentials for cookie-based auth

---

## Testing

Use the provided Swagger UI at `http://localhost:3000/api` for interactive testing of REST endpoints.

For GraphQL, use the GraphQL Playground at `http://localhost:3000/graphql`.

### Example Test Flow

1. Register a new user
2. Extract access and refresh tokens
3. Access protected endpoints with access token
4. Refresh token when access token expires
5. Test role-based access with different user roles
6. Test password reset flow
7. Logout to revoke tokens
