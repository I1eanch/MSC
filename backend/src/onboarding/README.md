# Onboarding Module

This module handles user onboarding data including demographics, fitness goals, activity levels, and health constraints.

## Features

- **User Demographics**: Store age, gender, height, and weight
- **Fitness Goals**: Multiple goal selection from predefined list
- **Activity Levels**: Current fitness activity level
- **Health Constraints**: Track any health limitations
- **Progress Tracking**: Calculate onboarding completion percentage

## Entities

### Goal
Predefined fitness goals that users can select:
- Weight Loss
- Muscle Gain
- Improved Endurance
- Flexibility
- General Fitness
- Sports Performance
- Stress Relief
- Rehabilitation

### ActivityLevel
Predefined activity level categories:
- Sedentary
- Lightly Active
- Moderately Active
- Very Active
- Extremely Active

### UserOnboarding
Stores user-specific onboarding data:
- Demographics (age, gender, height, weight)
- Activity level reference
- Health constraints (text field)
- Completion percentage (auto-calculated)

## API Endpoints

### REST API

#### GET /onboarding/goals
Get all available fitness goals.
- Public endpoint
- Returns array of Goal objects

#### GET /onboarding/activity-levels
Get all activity level options.
- Public endpoint
- Returns array of ActivityLevel objects

#### POST /onboarding/profile
Create onboarding profile for authenticated user.
- Requires authentication
- Body: CreateOnboardingDto
- Returns UserOnboarding object

#### PATCH /onboarding/profile
Update onboarding profile for authenticated user.
- Requires authentication
- Body: UpdateOnboardingDto (partial)
- Returns updated UserOnboarding object

#### GET /onboarding/profile
Get current user's onboarding profile.
- Requires authentication
- Returns UserOnboarding object or null

### GraphQL API

#### Query: goals
Get all available fitness goals.

#### Query: activityLevels
Get all activity level options.

#### Query: myOnboardingProfile
Get current user's onboarding profile.
- Requires authentication

#### Mutation: createOnboardingProfile
Create onboarding profile for authenticated user.
- Requires authentication
- Input: CreateOnboardingDto

#### Mutation: updateOnboardingProfile
Update onboarding profile for authenticated user.
- Requires authentication
- Input: UpdateOnboardingDto

## Database Migrations

### Migration 1: Create Tables
Creates:
- `goals` table
- `activity_levels` table
- `user_onboarding` table
- `user_goals` junction table

### Migration 2: Seed Data
Seeds:
- 8 predefined goals
- 5 activity levels

## Running Migrations

```bash
# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Testing

Unit tests are available in `onboarding.service.spec.ts`.

Integration tests are available in `test/onboarding.e2e-spec.ts`.

Run tests:
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Usage Example

### REST API
```typescript
// Get goals
const goals = await fetch('/onboarding/goals');

// Create profile
const profile = await fetch('/onboarding/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    age: 25,
    gender: 'male',
    height: 180,
    weight: 75,
    activityLevelId: 'activity-level-id',
    healthConstraints: 'None',
    goalIds: ['goal-id-1', 'goal-id-2']
  })
});
```

### GraphQL
```graphql
# Get goals
query {
  goals {
    id
    name
    description
    displayOrder
  }
}

# Create profile
mutation {
  createOnboardingProfile(input: {
    age: 25
    gender: "male"
    height: 180
    weight: 75
    activityLevelId: "activity-level-id"
    healthConstraints: "None"
    goalIds: ["goal-id-1", "goal-id-2"]
  }) {
    id
    age
    completionPercentage
  }
}
```
