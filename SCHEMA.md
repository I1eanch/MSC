# Database Schema Documentation

## Overview

The habits tracking system uses PostgreSQL with TypeORM for data persistence. The schema supports user authentication, habit creation, completion tracking, and streak calculations.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (UUID)   │──┐
│ email       │  │
│ password    │  │
│ name        │  │
│ goals[]     │  │
│ isActive    │  │
│ created_at  │  │
│ updated_at  │  │
└─────────────┘  │
                 │ 1:N
                 │
            ┌────▼────────┐
            │   Habit     │
            ├─────────────┤
            │ id (UUID)   │──┐
            │ name        │  │
            │ description │  │
            │ frequency   │  │
            │ targetCount │  │
            │ isActive    │  │
            │ color       │  │
            │ icon        │  │
            │ reminder{}  │  │
            │ goal        │  │
            │ currentStr..│  │
            │ longestStr..│  │
            │ lastCompl.. │  │
            │ userId (FK) │  │
            │ created_at  │  │
            │ updated_at  │  │
            └─────────────┘  │
                            │ 1:N
                            │
                    ┌───────▼────────────┐
                    │ HabitCompletion    │
                    ├────────────────────┤
                    │ id (UUID)          │
                    │ habitId (FK)       │
                    │ completedDate      │
                    │ count              │
                    │ notes              │
                    │ created_at         │
                    └────────────────────┘

┌─────────────────────┐
│  HabitTemplate      │ (Independent)
├─────────────────────┤
│ id (UUID)           │
│ name                │
│ description         │
│ frequency           │
│ targetCount         │
│ color               │
│ icon                │
│ category            │
│ goals[]             │
│ isDefault           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Entities

### 1. User

Stores user account information and authentication credentials.

**Table**: `users`

| Column      | Type      | Constraints         | Description                    |
|-------------|-----------|---------------------|--------------------------------|
| id          | UUID      | PRIMARY KEY         | Unique user identifier         |
| email       | VARCHAR   | UNIQUE, NOT NULL    | User email (used for login)    |
| password    | VARCHAR   | NOT NULL            | Hashed password (bcrypt)       |
| name        | VARCHAR   | NULLABLE            | User display name              |
| goals       | JSONB     | NULLABLE            | Array of user goals            |
| isActive    | BOOLEAN   | DEFAULT true        | Account status                 |
| createdAt   | TIMESTAMP | NOT NULL            | Account creation timestamp     |
| updatedAt   | TIMESTAMP | NOT NULL            | Last update timestamp          |

**Relationships**:
- One-to-Many with Habit

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

---

### 2. Habit

Represents a habit that a user wants to track.

**Table**: `habits`

| Column          | Type      | Constraints                | Description                      |
|-----------------|-----------|----------------------------|----------------------------------|
| id              | UUID      | PRIMARY KEY                | Unique habit identifier          |
| name            | VARCHAR   | NOT NULL                   | Habit name                       |
| description     | TEXT      | NULLABLE                   | Habit description                |
| frequency       | ENUM      | DEFAULT 'daily'            | daily/weekly/custom              |
| targetCount     | INTEGER   | NULLABLE                   | Target number of completions     |
| isActive        | BOOLEAN   | DEFAULT true               | Whether habit is active          |
| color           | VARCHAR   | NULLABLE                   | Color code for UI                |
| icon            | VARCHAR   | NULLABLE                   | Icon identifier/emoji            |
| reminder        | JSONB     | NULLABLE                   | Reminder settings object         |
| goal            | VARCHAR   | NULLABLE                   | Associated goal                  |
| currentStreak   | INTEGER   | DEFAULT 0                  | Current consecutive days         |
| longestStreak   | INTEGER   | DEFAULT 0                  | Longest streak achieved          |
| lastCompletedAt | TIMESTAMP | NULLABLE                   | Last completion timestamp        |
| userId          | UUID      | FOREIGN KEY, NOT NULL      | Reference to user                |
| createdAt       | TIMESTAMP | NOT NULL                   | Habit creation timestamp         |
| updatedAt       | TIMESTAMP | NOT NULL                   | Last update timestamp            |

**Relationships**:
- Many-to-One with User
- One-to-Many with HabitCompletion

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId`
- INDEX on `isActive`

**JSONB Fields**:

```typescript
reminder: {
  enabled: boolean;
  time: string; // HH:mm format
}
```

---

### 3. HabitCompletion

Logs each completion of a habit on a specific date.

**Table**: `habit_completions`

| Column         | Type      | Constraints                    | Description                    |
|----------------|-----------|--------------------------------|--------------------------------|
| id             | UUID      | PRIMARY KEY                    | Unique completion identifier   |
| habitId        | UUID      | FOREIGN KEY, NOT NULL          | Reference to habit             |
| completedDate  | DATE      | NOT NULL                       | Date of completion             |
| count          | INTEGER   | DEFAULT 1                      | Number of times completed      |
| notes          | TEXT      | NULLABLE                       | Optional notes                 |
| createdAt      | TIMESTAMP | NOT NULL                       | Record creation timestamp      |

**Relationships**:
- Many-to-One with Habit

**Constraints**:
- UNIQUE constraint on (habitId, completedDate) - prevents duplicate completions for same date

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`habitId`, `completedDate`)
- INDEX on `completedDate` for date range queries

---

### 4. HabitTemplate

Pre-defined habit templates categorized by user goals.

**Table**: `habit_templates`

| Column       | Type      | Constraints    | Description                     |
|--------------|-----------|----------------|---------------------------------|
| id           | UUID      | PRIMARY KEY    | Unique template identifier      |
| name         | VARCHAR   | NOT NULL       | Template name                   |
| description  | TEXT      | NULLABLE       | Template description            |
| frequency    | ENUM      | DEFAULT 'daily'| daily/weekly/custom             |
| targetCount  | INTEGER   | NULLABLE       | Suggested target count          |
| color        | VARCHAR   | NULLABLE       | Suggested color                 |
| icon         | VARCHAR   | NULLABLE       | Suggested icon                  |
| category     | VARCHAR   | NOT NULL       | Template category               |
| goals        | JSONB     | NOT NULL       | Array of applicable goals       |
| isDefault    | BOOLEAN   | DEFAULT true   | Whether included by default     |
| createdAt    | TIMESTAMP | NOT NULL       | Template creation timestamp     |
| updatedAt    | TIMESTAMP | NOT NULL       | Last update timestamp           |

**Relationships**: None (independent entity)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `category`
- GIN INDEX on `goals` for array containment queries

**Categories**:
- Fitness
- Health
- Learning
- Mental Health
- Nutrition
- Personal Growth
- Lifestyle
- Hobbies
- Relationships
- Digital Wellness

---

## Streak Calculation Logic

The streak calculation is performed in the `HabitsService` and follows these rules:

### Current Streak Algorithm

1. **Base Condition**: If no completions exist, streak is 0
2. **Grace Period**: Current streak is active if most recent completion is today OR yesterday
3. **Consecutive Days**: Count backwards from most recent completion, incrementing for each consecutive day
4. **Break Condition**: Stop counting when a gap (non-consecutive day) is found

### Longest Streak Algorithm

1. Scan through all completions sorted by date (descending)
2. Track consecutive days as a temporary streak
3. When a gap is found, compare temporary streak to longest streak
4. Reset temporary streak and continue
5. Return the maximum streak found

### Example Scenarios

**Scenario 1: Active Streak**
```
Today: Nov 5
Completions: Nov 5, Nov 4, Nov 3
Result: currentStreak = 3, longestStreak = 3
```

**Scenario 2: Grace Period**
```
Today: Nov 5
Completions: Nov 4, Nov 3, Nov 2
Result: currentStreak = 3, longestStreak = 3
```

**Scenario 3: Broken Streak**
```
Today: Nov 5
Completions: Nov 2, Nov 1, Oct 31
Result: currentStreak = 0, longestStreak = 3
```

**Scenario 4: Multiple Streaks**
```
Today: Nov 5
Completions: Nov 5, Nov 4, Oct 30, Oct 29, Oct 28, Oct 27
Result: currentStreak = 2, longestStreak = 4
```

---

## Data Integrity

### Constraints

1. **User Email Uniqueness**: Enforced at database level
2. **Completion Date Uniqueness**: One completion per habit per day
3. **Cascade Deletes**: 
   - Deleting a user deletes all their habits
   - Deleting a habit deletes all its completions
4. **Required Fields**: Email, password for users; name, userId for habits

### Validation

- Email format validation (application level)
- Password minimum length (6 characters)
- Date format validation for completions
- Count must be positive integer

---

## Migration Strategy

The application uses TypeORM with `synchronize: true` in development mode, which automatically creates/updates tables based on entities.

For production:
1. Set `synchronize: false`
2. Use TypeORM migrations
3. Generate migrations: `npm run migration:generate`
4. Run migrations: `npm run migration:run`

---

## Seeding

Default habit templates are seeded using the seed script:

```bash
npm run seed
```

The seed file is located at: `src/database/seeds/habit-templates.seed.ts`

It includes 15 default templates across various categories, each mapped to relevant user goals.

---

## Performance Considerations

### Indexes

- User lookups by email (login): O(log n) with UNIQUE index
- Habit lookups by userId: O(log n) with index
- Completion lookups by date range: O(log n) with index on completedDate
- Template filtering by goals: Efficient with GIN index on JSONB array

### Query Optimization

- Streak calculations are done in-memory after fetching completions
- History queries use date range indexes
- Eager loading avoided by default (use relations parameter when needed)

### Scalability

- UUID primary keys allow distributed systems
- JSONB fields reduce need for additional tables
- Completion records grow linearly with user activity
- Consider partitioning `habit_completions` by date for large datasets

---

## Security

### Password Storage

- Passwords hashed with bcrypt (10 rounds)
- Never stored or transmitted in plain text
- Password field excluded from query results

### Access Control

- All habit endpoints protected with JWT authentication
- Users can only access their own data (userId validation)
- Soft delete option available (isActive flag)

### SQL Injection

- TypeORM parameterized queries prevent SQL injection
- Input validation via class-validator

---

## Future Schema Enhancements

Potential additions for future versions:

1. **Habit Sharing**: Add `shared_habits` table for social features
2. **Achievements**: Track milestones and awards
3. **Habit Groups**: Organize habits into categories
4. **Recurring Patterns**: More complex scheduling (e.g., "every Monday and Wednesday")
5. **Analytics**: Aggregate tables for performance metrics
6. **Notifications**: Track notification delivery status
7. **Habit History Snapshots**: Archive deleted habits

---

## Backup and Recovery

Recommended PostgreSQL backup strategy:

1. **Daily backups**: Full database backup
2. **Transaction logs**: Enable WAL archiving
3. **Retention**: Keep 30 days of backups
4. **Test restores**: Monthly restore tests

```bash
# Backup command
pg_dump -U postgres habits_db > backup_$(date +%Y%m%d).sql

# Restore command
psql -U postgres habits_db < backup_20240115.sql
```
