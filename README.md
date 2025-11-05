# Habits Tracker Backend API

A comprehensive backend API for tracking daily habits, completion logs, and calculating streaks. Built with NestJS, TypeORM, and PostgreSQL.

## Features

- ✅ **CRUD Operations** for habits
- ✅ **Completion Logging** with date tracking
- ✅ **Streak Calculations** (current and longest streaks)
- ✅ **Habit Templates** categorized by user goals
- ✅ **JWT Authentication** for secure endpoints
- ✅ **History Retrieval** with date filtering
- ✅ **Comprehensive Tests** covering streak logic
- ✅ **OpenAPI/Swagger** documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Database Schema

### Entities

1. **User**
   - id (UUID)
   - email (unique)
   - password (hashed)
   - name
   - goals (JSONB array)
   - isActive
   - timestamps

2. **Habit**
   - id (UUID)
   - name
   - description
   - frequency (daily/weekly/custom)
   - targetCount
   - isActive
   - color, icon
   - reminder settings (JSONB)
   - goal
   - currentStreak
   - longestStreak
   - lastCompletedAt
   - userId (FK to User)
   - timestamps

3. **HabitCompletion**
   - id (UUID)
   - habitId (FK to Habit)
   - completedDate (unique per habit)
   - count
   - notes
   - createdAt

4. **HabitTemplate**
   - id (UUID)
   - name, description
   - frequency, targetCount
   - color, icon
   - category
   - goals (JSONB array)
   - isDefault
   - timestamps

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Habits (Protected)

- `GET /habits` - Get all user habits
- `POST /habits` - Create new habit
- `GET /habits/:id` - Get specific habit
- `PATCH /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `POST /habits/:id/complete` - Mark habit complete for a date
- `DELETE /habits/:id/complete/:date` - Remove completion
- `GET /habits/:id/history` - Get completion history with stats

### Templates (Protected)

- `GET /habits/templates` - Get all templates
- `GET /habits/templates/by-goals?goals=fitness,health` - Filter by goals
- `POST /habits/templates/:id/create` - Create habit from template

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (auto-sync in dev mode)
npm run start:dev

# Seed default habit templates
npm run seed
```

## Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=habits_db

JWT_SECRET=your-secret-key-change-in-production
```

## Testing

The service includes comprehensive unit tests, particularly for streak calculation logic:

```bash
npm run test
```

### Streak Calculation Logic

The streak calculator implements the following rules:

1. **Current Streak**: Counts consecutive days from today (or yesterday) backwards
2. **Longest Streak**: Finds the maximum consecutive days in all history
3. **Grace Period**: Includes yesterday in current streak calculation
4. **Gap Handling**: Resets current streak if most recent completion is older than yesterday

### Test Coverage

- ✅ Empty completions array
- ✅ Consecutive days including today
- ✅ Consecutive days including yesterday
- ✅ Broken streaks (gaps in completions)
- ✅ Finding longest streak in history
- ✅ Single completions
- ✅ Multiple streak periods

## API Documentation

Once the application is running, visit:

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Example Usage

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "goals": ["fitness", "health"]
  }'
```

### 2. Create a Habit

```bash
curl -X POST http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Exercise",
    "description": "30 minutes cardio",
    "frequency": "daily",
    "color": "#FF6B6B",
    "icon": "🏃"
  }'
```

### 3. Mark Habit Complete

```bash
curl -X POST http://localhost:3000/habits/{habitId}/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completedDate": "2024-01-15",
    "count": 1,
    "notes": "Felt great!"
  }'
```

### 4. Get Habit History

```bash
curl -X GET "http://localhost:3000/habits/{habitId}/history?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Setup

### Using Docker (Recommended)

```bash
docker run --name habits-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=habits_db \
  -p 5432:5432 \
  -d postgres:15
```

### Manual PostgreSQL Setup

```sql
CREATE DATABASE habits_db;
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Route guards protecting all habit endpoints
- Input validation on all DTOs
- SQL injection protection via TypeORM

## Architecture

```
src/
├── auth/               # Authentication module
│   ├── dto/           # Login/Register DTOs
│   ├── guards/        # JWT and Local guards
│   ├── strategies/    # Passport strategies
│   └── auth.service.ts
├── habits/            # Habits module
│   ├── dto/          # Habit DTOs
│   ├── habits.service.ts
│   ├── habits.service.spec.ts
│   └── habits.controller.ts
├── database/          # Database configuration
│   ├── entities/     # TypeORM entities
│   ├── seeds/        # Seed data
│   └── data-source.ts
└── main.ts           # Application bootstrap
```

## License

MIT
