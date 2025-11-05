# Onboarding Feature Implementation

## Overview

This document describes the implementation of the user onboarding feature that collects user demographics, fitness goals, activity levels, and health constraints.

## Database Schema

### Tables Created

1. **goals** - Lookup table for fitness goals
   - `id` (UUID, PK)
   - `name` (VARCHAR, UNIQUE)
   - `description` (TEXT, nullable)
   - `displayOrder` (INTEGER)

2. **activity_levels** - Lookup table for activity levels
   - `id` (UUID, PK)
   - `name` (VARCHAR, UNIQUE)
   - `description` (TEXT, nullable)
   - `displayOrder` (INTEGER)

3. **user_onboarding** - User-specific onboarding data
   - `id` (UUID, PK)
   - `userId` (UUID, FK to users)
   - `age` (INTEGER, nullable)
   - `gender` (VARCHAR, nullable)
   - `height` (DECIMAL(5,2), nullable)
   - `weight` (DECIMAL(5,2), nullable)
   - `activityLevelId` (UUID, FK to activity_levels, nullable)
   - `healthConstraints` (TEXT, nullable)
   - `completionPercentage` (INTEGER, default 0)
   - `createdAt` (TIMESTAMP)
   - `updatedAt` (TIMESTAMP)

4. **user_goals** - Many-to-many junction table
   - `userId` (UUID, FK to users)
   - `goalId` (UUID, FK to goals)

### Relationships

- User ↔ Goal: Many-to-Many (through user_goals)
- UserOnboarding → User: One-to-One
- UserOnboarding → ActivityLevel: Many-to-One

## Migrations

### 1700000000000-CreateOnboardingTables.ts
Creates all onboarding-related tables and foreign key constraints.

### 1700000000001-SeedGoalsAndActivityLevels.ts
Seeds the lookup tables with predefined data:

**Goals:**
1. Weight Loss
2. Muscle Gain
3. Improved Endurance
4. Flexibility
5. General Fitness
6. Sports Performance
7. Stress Relief
8. Rehabilitation

**Activity Levels:**
1. Sedentary
2. Lightly Active
3. Moderately Active
4. Very Active
5. Extremely Active

## API Endpoints

### REST API (OpenAPI/Swagger)

#### Public Endpoints

```
GET /onboarding/goals
- Returns: Goal[]
- Description: Get all available fitness goals
```

```
GET /onboarding/activity-levels
- Returns: ActivityLevel[]
- Description: Get all activity level options
```

#### Protected Endpoints (Require JWT)

```
POST /onboarding/profile
- Body: CreateOnboardingDto
- Returns: UserOnboarding
- Description: Create onboarding profile for current user
```

```
PATCH /onboarding/profile
- Body: UpdateOnboardingDto (partial)
- Returns: UserOnboarding
- Description: Update onboarding profile for current user
```

```
GET /onboarding/profile
- Returns: UserOnboarding | null
- Description: Get current user's onboarding profile
```

### GraphQL API

#### Queries

```graphql
goals: [Goal!]!
activityLevels: [ActivityLevel!]!
myOnboardingProfile: UserOnboarding  # Requires auth
```

#### Mutations

```graphql
createOnboardingProfile(input: CreateOnboardingDto!): UserOnboarding!  # Requires auth
updateOnboardingProfile(input: UpdateOnboardingDto!): UserOnboarding!  # Requires auth
```

## DTOs

### CreateOnboardingDto
```typescript
{
  age?: number;              // 1-150
  gender?: string;
  height?: number;           // cm, positive
  weight?: number;           // kg, positive
  activityLevelId?: string;  // UUID
  healthConstraints?: string;
  goalIds?: string[];        // Array of UUIDs
}
```

### UpdateOnboardingDto
Partial version of CreateOnboardingDto - all fields optional.

## Business Logic

### Completion Percentage Calculation
The service automatically calculates completion percentage based on 7 fields:
1. Age
2. Gender
3. Height
4. Weight
5. Activity Level
6. Health Constraints
7. Goals (at least one)

Formula: `(completed_fields / 7) * 100`

### Upsert Behavior
When creating a profile, if one already exists for the user, it will be updated instead of creating a duplicate.

## Testing

### Unit Tests
- Located: `src/onboarding/onboarding.service.spec.ts`
- Coverage: Service methods, error handling, repository interactions
- Mocks all dependencies

### Integration Tests
- Located: `test/onboarding.e2e-spec.ts`
- Tests full request/response cycle
- Tests authentication requirements
- Tests data validation
- Creates/cleans up test data

Run tests:
```bash
# Unit tests
npm test -- onboarding.service

# E2E tests
npm run test:e2e -- onboarding.e2e-spec
```

## Admin Access

The onboarding data is accessible through:

1. **Database**: Direct PostgreSQL access to tables
2. **REST API**: Admin users can query user profiles
3. **GraphQL Playground**: Available at `/graphql` in development
4. **Swagger UI**: Available at `/api` for REST documentation

## Security

- All profile creation/update endpoints require JWT authentication
- Users can only access their own onboarding data
- Public endpoints (goals, activity levels) are read-only
- Input validation via class-validator
- SQL injection protection via TypeORM parameterized queries

## Migration Commands

```bash
# Run migrations
cd backend
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration (after entity changes)
npm run migration:generate -- src/database/migrations/MigrationName
```

## Environment Variables

Required in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=identity_db
```

## Module Structure

```
backend/src/onboarding/
├── dto/
│   ├── create-onboarding.dto.ts
│   ├── update-onboarding.dto.ts
│   └── onboarding-response.dto.ts
├── onboarding.controller.ts
├── onboarding.service.ts
├── onboarding.service.spec.ts
├── onboarding.resolver.ts
├── onboarding.module.ts
└── README.md
```

## Future Enhancements

Potential improvements:
1. Add BMI calculation
2. Add recommended workout programs based on goals
3. Add progress tracking over time
4. Add photo upload for progress photos
5. Add goal progress percentage
6. Add notifications for incomplete profiles
7. Add onboarding wizard UI component
