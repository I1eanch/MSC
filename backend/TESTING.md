# Testing Documentation

Comprehensive guide for testing the Identity Backend system.

## Test Overview

The backend includes extensive unit tests covering:
- ✅ Authentication service (register, login, refresh, password reset)
- ✅ User management service (CRUD operations)
- ✅ Email service (SES integration)
- ✅ Success and error scenarios
- ✅ Edge cases and validation

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run specific test file
npm test auth.service.spec.ts

# Run tests with verbose output
npm test -- --verbose
```

## Test Coverage

Expected coverage:

| Module | Coverage Target |
|--------|----------------|
| Auth Service | 95%+ |
| Users Service | 95%+ |
| Email Service | 80%+ |
| Controllers | 70%+ |
| Overall | 85%+ |

## Test Structure

### Auth Service Tests (`auth.service.spec.ts`)

#### 1. Registration Tests
- ✅ Successfully register a new user
- ✅ Hash password with bcrypt
- ✅ Generate access and refresh tokens
- ✅ Send welcome email
- ✅ Handle duplicate email (ConflictException)

#### 2. Login Tests
- ✅ Successfully login with valid credentials
- ✅ Return tokens and user object
- ✅ Reject invalid email (UnauthorizedException)
- ✅ Reject invalid password (UnauthorizedException)

#### 3. Token Refresh Tests
- ✅ Generate new token pair
- ✅ Revoke old refresh token
- ✅ Return new access and refresh tokens

#### 4. Logout Tests
- ✅ Revoke all user refresh tokens
- ✅ Mark tokens as revoked in database

#### 5. Password Reset Request Tests
- ✅ Generate reset token
- ✅ Send reset email to valid user
- ✅ Silently handle non-existent users (security)
- ✅ Set token expiration

#### 6. Password Reset Tests
- ✅ Reset password with valid token
- ✅ Revoke all existing sessions
- ✅ Reject invalid token (BadRequestException)
- ✅ Reject expired token (BadRequestException)

#### 7. Token Validation Tests
- ✅ Validate active refresh token
- ✅ Reject revoked token
- ✅ Reject expired token
- ✅ Auto-revoke expired tokens

### User Service Tests (`users.service.spec.ts`)

#### 1. Create User Tests
- ✅ Successfully create user
- ✅ Hash password before saving
- ✅ Handle duplicate email (ConflictException)

#### 2. Find All Users Tests
- ✅ Return array of users
- ✅ Exclude password from results
- ✅ Return empty array when no users

#### 3. Find One User Tests
- ✅ Find user by ID
- ✅ Exclude password from result
- ✅ Handle not found (NotFoundException)

#### 4. Find By Email Tests
- ✅ Find user by email
- ✅ Include password (for authentication)
- ✅ Return null if not found

#### 5. Update User Tests
- ✅ Update user role
- ✅ Save changes to database
- ✅ Handle not found (NotFoundException)

#### 6. Delete User Tests
- ✅ Remove user from database
- ✅ Handle not found (NotFoundException)

#### 7. Password Validation Tests
- ✅ Return true for valid password
- ✅ Return false for invalid password
- ✅ Use bcrypt.compare

#### 8. Update Password Tests
- ✅ Hash new password
- ✅ Clear reset token
- ✅ Clear reset expiration
- ✅ Handle not found (NotFoundException)

#### 9. Password Reset Token Tests
- ✅ Set reset token
- ✅ Set expiration time
- ✅ Find user by reset token
- ✅ Reject expired token

### Email Service Tests (`email.service.spec.ts`)

#### 1. Configuration Tests
- ✅ Initialize with AWS credentials
- ✅ Handle missing credentials gracefully
- ✅ Log warnings when emails can't be sent

#### 2. Password Reset Email Tests
- ✅ Send email via SES
- ✅ Include reset link with token
- ✅ Use HTML and text templates
- ✅ Log success/failure

#### 3. Welcome Email Tests
- ✅ Send email via SES
- ✅ Include user email
- ✅ Use HTML and text templates

## Mock Implementations

### User Repository Mock
```typescript
{
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
}
```

### JWT Service Mock
```typescript
{
  sign: jest.fn(),
}
```

### Config Service Mock
```typescript
{
  get: jest.fn((key: string) => {
    // Return test configuration values
  }),
}
```

### Email Service Mock
```typescript
{
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}
```

## Test Data

### Mock User
```typescript
{
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: UserRole.USER,
  passwordResetToken: null,
  passwordResetExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Mock Tokens
```typescript
{
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
}
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```typescript
it('should successfully register a new user', async () => {
  // Arrange
  const registerDto = { email: 'test@example.com', password: 'password123' };
  mockUsersService.create.mockResolvedValue(mockUser);
  
  // Act
  const result = await service.register(registerDto);
  
  // Assert
  expect(result).toHaveProperty('accessToken');
  expect(usersService.create).toHaveBeenCalledWith(registerDto);
});
```

### 2. Clear Mocks Between Tests
```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### 3. Test Both Success and Error Cases
```typescript
describe('login', () => {
  it('should successfully login with valid credentials', async () => {
    // Test success case
  });

  it('should throw UnauthorizedException with invalid email', async () => {
    // Test error case
  });
});
```

### 4. Use Descriptive Test Names
- Start with "should"
- Describe expected behavior
- Include context (e.g., "with valid credentials")

### 5. Mock External Dependencies
- Database repositories
- External services (email, AWS)
- Configuration
- Third-party libraries

## Manual Testing

### Using Swagger UI

1. Navigate to `http://localhost:3000/api`
2. Click on an endpoint to expand
3. Click "Try it out"
4. Fill in request body
5. Click "Execute"
6. Review response

### Using GraphQL Playground

1. Navigate to `http://localhost:3000/graphql`
2. Write GraphQL query/mutation
3. Add HTTP headers if needed (Authorization)
4. Click play button
5. Review response

### Using cURL

#### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get Users (with token)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import OpenAPI spec from `http://localhost:3000/api-json`
2. Set up environment variables for tokens
3. Test all endpoints
4. Create test collections

## Integration Testing

For full integration tests:

```bash
npm run test:e2e
```

Integration tests should:
- Use a test database
- Test full request/response cycle
- Test authentication flow end-to-end
- Test error handling
- Test concurrent requests

## Continuous Integration

Add to CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:cov

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Test Reports

After running tests with coverage:

```bash
npm run test:cov
```

View HTML report:
```bash
open coverage/lcov-report/index.html
```

## Common Issues

### 1. Tests Failing Due to Async Operations
**Solution**: Use `async/await` or return promises

### 2. Mock Not Working
**Solution**: Ensure mock is set up before calling the method

### 3. Unexpected Token Errors
**Solution**: Check TypeScript configuration and Jest setup

### 4. Timeout Errors
**Solution**: Increase Jest timeout or optimize test

## Performance Testing

For load testing:

```bash
# Install k6
brew install k6  # macOS
sudo apt install k6  # Ubuntu

# Run load test
k6 run load-test.js
```

## Security Testing

Test for:
- SQL injection (handled by TypeORM)
- XSS attacks (sanitize inputs)
- CSRF attacks (use CSRF tokens)
- Rate limiting
- JWT token validation
- Password strength enforcement

## Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then attach debugger in VS Code or Chrome DevTools
```

## Test Maintenance

- Update tests when changing business logic
- Keep mock data synchronized with entities
- Review and update test coverage regularly
- Remove obsolete tests
- Document complex test scenarios
