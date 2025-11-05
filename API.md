# API Documentation

Complete REST API documentation for the Habits Tracker backend.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login or registration, include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Authentication Endpoints

#### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "goals": ["fitness", "health", "learning"]
}
```

**Response** (201 Created):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Email already exists or validation error

---

#### Login User

Authenticate and receive JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials

---

### Habit Endpoints

All habit endpoints require authentication.

#### Create Habit

Create a new habit for the authenticated user.

**Endpoint**: `POST /habits`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Morning Exercise",
  "description": "30 minutes of cardio or strength training",
  "frequency": "daily",
  "targetCount": 1,
  "color": "#FF6B6B",
  "icon": "🏃",
  "reminder": {
    "enabled": true,
    "time": "07:00"
  },
  "goal": "fitness"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Morning Exercise",
  "description": "30 minutes of cardio or strength training",
  "frequency": "daily",
  "targetCount": 1,
  "isActive": true,
  "color": "#FF6B6B",
  "icon": "🏃",
  "reminder": {
    "enabled": true,
    "time": "07:00"
  },
  "goal": "fitness",
  "currentStreak": 0,
  "longestStreak": 0,
  "lastCompletedAt": null,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Validation Rules**:
- `name`: Required, string
- `frequency`: Optional, enum: "daily", "weekly", "custom" (default: "daily")
- `targetCount`: Optional, positive integer
- `reminder.time`: Format HH:mm

---

#### Get All Habits

Retrieve all active habits for the authenticated user.

**Endpoint**: `GET /habits`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "daily",
    "targetCount": 1,
    "isActive": true,
    "color": "#FF6B6B",
    "icon": "🏃",
    "currentStreak": 5,
    "longestStreak": 12,
    "lastCompletedAt": "2024-01-15T08:30:00.000Z",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Read for 30 Minutes",
    "description": "Daily reading habit",
    "frequency": "daily",
    "currentStreak": 3,
    "longestStreak": 7,
    ...
  }
]
```

---

#### Get Single Habit

Retrieve details of a specific habit.

**Endpoint**: `GET /habits/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Morning Exercise",
  "description": "30 minutes of cardio or strength training",
  "frequency": "daily",
  "targetCount": 1,
  "isActive": true,
  "color": "#FF6B6B",
  "icon": "🏃",
  "reminder": {
    "enabled": true,
    "time": "07:00"
  },
  "goal": "fitness",
  "currentStreak": 5,
  "longestStreak": 12,
  "lastCompletedAt": "2024-01-15T08:30:00.000Z",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "completions": [
    {
      "id": "...",
      "completedDate": "2024-01-15",
      "count": 1,
      "notes": "Great workout!"
    }
  ],
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-15T08:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Habit not found or doesn't belong to user

---

#### Update Habit

Update habit details.

**Endpoint**: `PATCH /habits/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (all fields optional):
```json
{
  "name": "Evening Exercise",
  "description": "Updated description",
  "isActive": false,
  "color": "#00FF00"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Evening Exercise",
  "description": "Updated description",
  ...updated fields...
}
```

**Error Responses**:
- `404 Not Found`: Habit not found

---

#### Delete Habit

Permanently delete a habit and all its completions.

**Endpoint**: `DELETE /habits/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (204 No Content)

**Error Responses**:
- `404 Not Found`: Habit not found

---

#### Mark Habit Complete

Log a completion for a specific date.

**Endpoint**: `POST /habits/:id/complete`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "completedDate": "2024-01-15",
  "count": 1,
  "notes": "Felt great after the workout!"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "habitId": "550e8400-e29b-41d4-a716-446655440001",
  "completedDate": "2024-01-15T00:00:00.000Z",
  "count": 1,
  "notes": "Felt great after the workout!",
  "createdAt": "2024-01-15T08:30:00.000Z"
}
```

**Notes**:
- Automatically updates `currentStreak` and `longestStreak`
- Sets `lastCompletedAt` to current timestamp
- Time component of `completedDate` is normalized to midnight

**Error Responses**:
- `400 Bad Request`: Already completed for this date
- `404 Not Found`: Habit not found

---

#### Remove Completion

Remove a completion for a specific date.

**Endpoint**: `DELETE /habits/:id/complete/:date`

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `date`: Date in ISO format (YYYY-MM-DD)

**Example**: `DELETE /habits/550e8400-e29b-41d4-a716-446655440001/complete/2024-01-15`

**Response** (204 No Content)

**Notes**:
- Automatically recalculates streaks after removal

**Error Responses**:
- `404 Not Found`: Completion not found for this date

---

#### Get Habit History

Retrieve completion history with statistics.

**Endpoint**: `GET /habits/:id/history`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate` (optional): Start date for filtering (ISO format)
- `endDate` (optional): End date for filtering (ISO format)

**Example**: `GET /habits/:id/history?startDate=2024-01-01&endDate=2024-01-31`

**Response** (200 OK):
```json
{
  "habit": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "currentStreak": 5,
    "longestStreak": 12
  },
  "completions": [
    {
      "id": "...",
      "completedDate": "2024-01-15T00:00:00.000Z",
      "count": 1,
      "notes": "Great workout!",
      "createdAt": "2024-01-15T08:30:00.000Z"
    },
    {
      "id": "...",
      "completedDate": "2024-01-14T00:00:00.000Z",
      "count": 1,
      "notes": null,
      "createdAt": "2024-01-14T07:45:00.000Z"
    }
  ],
  "stats": {
    "totalCompletions": 15,
    "currentStreak": 5,
    "longestStreak": 12
  }
}
```

**Error Responses**:
- `404 Not Found`: Habit not found

---

### Habit Template Endpoints

Templates are pre-defined habits categorized by user goals.

#### Get All Templates

Retrieve all available habit templates.

**Endpoint**: `GET /habits/templates`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "daily",
    "targetCount": 1,
    "color": "#FF6B6B",
    "icon": "🏃",
    "category": "Fitness",
    "goals": ["fitness", "health", "weight-loss"],
    "isDefault": true
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440002",
    "name": "Drink 8 Glasses of Water",
    "description": "Stay hydrated throughout the day",
    "frequency": "daily",
    "targetCount": 8,
    "color": "#4ECDC4",
    "icon": "💧",
    "category": "Health",
    "goals": ["health", "wellness"],
    "isDefault": true
  }
]
```

---

#### Get Templates by Goals

Filter templates based on user goals.

**Endpoint**: `GET /habits/templates/by-goals`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `goals`: Comma-separated list of goals

**Example**: `GET /habits/templates/by-goals?goals=fitness,health`

**Response** (200 OK):
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Morning Exercise",
    "category": "Fitness",
    "goals": ["fitness", "health", "weight-loss"],
    ...
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440002",
    "name": "Drink 8 Glasses of Water",
    "category": "Health",
    "goals": ["health", "wellness"],
    ...
  }
]
```

---

#### Create Habit from Template

Create a new habit based on a template.

**Endpoint**: `POST /habits/templates/:id/create`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Morning Exercise",
  "description": "30 minutes of cardio or strength training",
  "frequency": "daily",
  "targetCount": 1,
  "color": "#FF6B6B",
  "icon": "🏃",
  "goal": "fitness",
  "currentStreak": 0,
  "longestStreak": 0,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

**Error Responses**:
- `404 Not Found`: Template not found

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET/PATCH request
- `201 Created`: Successful POST request (resource created)
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Data Types and Enums

### HabitFrequency

```typescript
enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom'
}
```

### Reminder Object

```typescript
interface Reminder {
  enabled: boolean;
  time: string; // Format: "HH:mm" (24-hour)
}
```

---

## Rate Limiting

Currently not implemented. Recommended for production:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute per user

---

## Pagination

Currently not implemented. All list endpoints return all results. Future implementation will include:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

---

## Swagger/OpenAPI

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

Features:
- Try out endpoints directly from the browser
- View request/response schemas
- Test authentication flow
- Download OpenAPI specification

---

## Example Workflows

### Complete Onboarding Flow

1. **Register** → `POST /auth/register`
2. **Get Templates by Goals** → `GET /habits/templates/by-goals?goals=fitness,health`
3. **Create Habits from Templates** → `POST /habits/templates/:id/create`
4. **Mark First Completion** → `POST /habits/:id/complete`

### Daily Usage Flow

1. **Login** → `POST /auth/login`
2. **Get All Habits** → `GET /habits`
3. **Mark Completions** → `POST /habits/:id/complete` (for each habit)
4. **View Progress** → `GET /habits/:id/history`

### Analytics Flow

1. **Get Habit History** → `GET /habits/:id/history?startDate=2024-01-01&endDate=2024-01-31`
2. **Calculate Success Rate** → (completions / days) * 100
3. **Track Streak Trends** → Monitor currentStreak over time

---

## WebSocket Support

Not currently implemented. Future enhancement could include:
- Real-time streak updates
- Reminder notifications
- Collaborative habits with friends

---

## Mobile App Considerations

The API is designed to support mobile applications:

1. **Token Storage**: Store JWT in secure storage (Keychain/Keystore)
2. **Offline Mode**: Cache habits and queue completions for sync
3. **Background Sync**: Sync completions when app returns to foreground
4. **Push Notifications**: Use reminder times to schedule local notifications
5. **Optimistic Updates**: Update UI immediately, sync with server in background

---

## Best Practices

1. **Token Expiration**: Tokens expire in 7 days. Implement refresh token flow for production.
2. **Date Handling**: Always use ISO format (YYYY-MM-DD) for dates
3. **Timezone**: Server stores dates in UTC. Handle timezone conversion on client.
4. **Validation**: Client-side validation should match server-side rules
5. **Error Handling**: Always check error responses and display user-friendly messages
6. **Loading States**: Implement loading indicators for async operations
7. **Caching**: Cache habit list and sync periodically
