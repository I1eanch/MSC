# Onboarding Backend Feature - Summary

## Ticket Requirements ✓

### ✓ Onboarding Domain Created
- **Demographics**: Age, gender, height, weight
- **Fitness Goals**: Multiple selectable goals (lookup table)
- **Activity Levels**: Current fitness activity level (lookup table)
- **Health Constraints**: Free-text field for health limitations

### ✓ API Endpoints Provided

#### Fetch Choices Endpoints
- `GET /onboarding/goals` - Fetch all available fitness goals
- `GET /onboarding/activity-levels` - Fetch all activity level options
- GraphQL: `goals` and `activityLevels` queries

#### Submit/Update Profile Endpoints
- `POST /onboarding/profile` - Create onboarding profile
- `PATCH /onboarding/profile` - Update onboarding profile
- `GET /onboarding/profile` - Get user's profile
- GraphQL: `createOnboardingProfile`, `updateOnboardingProfile`, `myOnboardingProfile`

### ✓ Lookup Tables Seeded

#### Goals (8 entries)
1. Weight Loss
2. Muscle Gain
3. Improved Endurance
4. Flexibility
5. General Fitness
6. Sports Performance
7. Stress Relief
8. Rehabilitation

#### Activity Levels (5 entries)
1. Sedentary
2. Lightly Active
3. Moderately Active
4. Very Active
5. Extremely Active

### ✓ Migration Scripts Created
- `1700000000000-CreateOnboardingTables.ts` - Creates all tables and relationships
- `1700000000001-SeedGoalsAndActivityLevels.ts` - Seeds lookup data

### ✓ API Validated with Integration Tests
- E2E tests in `test/onboarding.e2e-spec.ts`
- Unit tests in `src/onboarding/onboarding.service.spec.ts`
- Tests cover all endpoints, authentication, and data validation

### ✓ Data Accessible via Admin
- REST API with Swagger documentation at `/api`
- GraphQL playground at `/graphql`
- Direct database access via PostgreSQL
- All tables properly indexed and queryable

## File Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── entities/
│   │   │   ├── goal.entity.ts                    [NEW]
│   │   │   ├── activity-level.entity.ts          [NEW]
│   │   │   ├── user-onboarding.entity.ts         [NEW]
│   │   │   ├── user.entity.ts                    [MODIFIED - added goals relation]
│   │   │   └── index.ts                          [MODIFIED]
│   │   ├── migrations/
│   │   │   ├── 1700000000000-CreateOnboardingTables.ts     [NEW]
│   │   │   └── 1700000000001-SeedGoalsAndActivityLevels.ts [NEW]
│   │   └── data-source.ts                        [NEW]
│   ├── onboarding/
│   │   ├── dto/
│   │   │   ├── create-onboarding.dto.ts          [NEW]
│   │   │   ├── update-onboarding.dto.ts          [NEW]
│   │   │   └── onboarding-response.dto.ts        [NEW]
│   │   ├── onboarding.controller.ts              [NEW]
│   │   ├── onboarding.service.ts                 [NEW]
│   │   ├── onboarding.service.spec.ts            [NEW]
│   │   ├── onboarding.resolver.ts                [NEW]
│   │   ├── onboarding.module.ts                  [NEW]
│   │   └── README.md                             [NEW]
│   └── app.module.ts                             [MODIFIED - added OnboardingModule]
├── test/
│   └── onboarding.e2e-spec.ts                    [NEW]
├── package.json                                  [MODIFIED - added migration scripts]
├── ONBOARDING_IMPLEMENTATION.md                  [NEW]
└── ONBOARDING_SUMMARY.md                         [NEW]
```

## Database Schema

### Tables
- `goals` - Fitness goals lookup table
- `activity_levels` - Activity level lookup table
- `user_onboarding` - User onboarding data (1:1 with users)
- `user_goals` - Many-to-many junction table (users ↔ goals)

### Relationships
- User ↔ Goal: Many-to-Many
- UserOnboarding → User: One-to-One
- UserOnboarding → ActivityLevel: Many-to-One

## Key Features

1. **Completion Tracking**: Automatic calculation of profile completion percentage
2. **Upsert Behavior**: Creating a profile updates existing one if present
3. **Validation**: Input validation using class-validator
4. **Security**: JWT authentication for profile operations
5. **Dual API**: Both REST and GraphQL support
6. **Documentation**: Swagger/OpenAPI for REST, GraphQL playground

## How to Use

### 1. Run Migrations
```bash
cd backend
npm install
npm run migration:run
```

### 2. Start Server
```bash
npm run start:dev
```

### 3. Access APIs
- REST: http://localhost:3000/api (Swagger UI)
- GraphQL: http://localhost:3000/graphql (Playground)

### 4. Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## API Examples

### REST API
```bash
# Get goals
curl http://localhost:3000/onboarding/goals

# Create profile (requires auth)
curl -X POST http://localhost:3000/onboarding/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "gender": "male",
    "height": 180,
    "weight": 75,
    "activityLevelId": "activity-level-uuid",
    "healthConstraints": "None",
    "goalIds": ["goal-uuid-1", "goal-uuid-2"]
  }'
```

### GraphQL
```graphql
# Get goals
query {
  goals {
    id
    name
    description
  }
}

# Create profile (requires auth)
mutation {
  createOnboardingProfile(input: {
    age: 25
    gender: "male"
    height: 180
    weight: 75
    activityLevelId: "activity-level-uuid"
    healthConstraints: "None"
    goalIds: ["goal-uuid-1", "goal-uuid-2"]
  }) {
    id
    completionPercentage
  }
}
```

## Testing Coverage

### Unit Tests
- ✓ Service initialization
- ✓ Get goals
- ✓ Get activity levels
- ✓ Create profile
- ✓ Update profile
- ✓ Find profile by user ID
- ✓ Error handling (user not found, profile not found)

### E2E Tests
- ✓ GET /onboarding/goals
- ✓ GET /onboarding/activity-levels
- ✓ POST /onboarding/profile (with/without auth)
- ✓ GET /onboarding/profile (with/without auth)
- ✓ PATCH /onboarding/profile (with/without auth)

## Next Steps

The onboarding backend is fully implemented and ready for integration with:
1. Mobile app onboarding screens
2. Admin dashboard
3. Analytics pipeline
4. Recommendation engine

All acceptance criteria met:
- ✅ Migration scripts created and ready to run
- ✅ API validated with integration tests
- ✅ Data accessible via admin (REST, GraphQL, Database)
