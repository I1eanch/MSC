# Dashboard Project

This repository contains a comprehensive dashboard backend with integration capabilities for multiple microservices.

## Structure

```
.
├── 1_start/              # Original static portfolio site (Allan Rayman)
├── backend/              # Dashboard Backend API (Node.js/Express)
│   ├── clients/          # HTTP clients for external services
│   ├── config/           # Configuration
│   ├── routes/           # API routes
│   ├── scheduler/        # Background jobs
│   ├── services/         # Business logic
│   ├── tests/            # Test suites
│   └── ...
└── index.html            # Root redirect
```

## Dashboard Backend

The main feature of this project is the **Dashboard Backend API** - a microservices aggregation layer that provides:

- **Daily Motivational Content**: Rotating inspirational quotes
- **Habit Tracking**: Integration with Habits Backend (NestJS)
- **Training Progress**: Integration with Training Backend (Flask)
- **Quick Links**: Organized shortcuts
- **Automated Schedulers**: Daily habit reset and progress computation

### Features

✅ **Dual Mode Operation**
- Local mode (port 3000): Standalone with JSON data
- Integrated mode (port 3001): With external microservices

✅ **Microservices Integration**
- Habits Backend (NestJS/TypeORM)
- Training Backend (Flask/SQLAlchemy)
- Video Infrastructure (planned)

✅ **Graceful Degradation**
- Automatic fallback to local data when services unavailable
- Source tracking in responses

✅ **Comprehensive Testing**
- 89 passing tests
- 70% code coverage

## Quick Start

### Option 1: Local Mode (Standalone)

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000` with local JSON data.

### Option 2: Integrated Mode (With External Services)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env to enable integrations
npm run start:integrated
```

Server runs on `http://localhost:3001` with external service integration.

## Documentation

Comprehensive documentation available in the `backend/` directory:

| Document | Description |
|----------|-------------|
| [README.md](./backend/README.md) | Original documentation |
| [README_INTEGRATED.md](./backend/README_INTEGRATED.md) | Integration features and architecture |
| [INTEGRATION.md](./backend/INTEGRATION.md) | Detailed integration guide |
| [QUICKSTART.md](./backend/QUICKSTART.md) | Quick start guide |
| [PROJECT_SUMMARY.md](./backend/PROJECT_SUMMARY.md) | Complete project summary |
| [ИНТЕГРАЦИЯ.md](./backend/ИНТЕГРАЦИЯ.md) | Integration guide (Russian) |

## API Examples

### Get Complete Dashboard

```bash
curl http://localhost:3001/api/dashboard
```

### Get Habits (with external API)

```bash
curl http://localhost:3001/api/dashboard/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-user-id: 123"
```

### Get Training Plan

```bash
curl http://localhost:3001/api/dashboard/workouts/plan \
  -H "x-user-id: 123"
```

### Check Health Status

```bash
curl http://localhost:3001/health
```

## Configuration

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# External Service Integration
ENABLE_HABITS_INTEGRATION=false
ENABLE_TRAINING_INTEGRATION=false
ENABLE_VIDEO_INTEGRATION=false

# Service URLs
HABITS_API_URL=http://localhost:3000
TRAINING_API_URL=http://localhost:5000
VIDEO_API_URL=http://localhost:4000

# Fallback Mode
FALLBACK_MODE=true
```

## Testing

```bash
cd backend
npm test
```

All tests work without external services thanks to fallback mode.

## Architecture

```
┌─────────────────────────────────────────────┐
│         Dashboard Backend (Node.js)         │
│              Port 3001                       │
│                                             │
│  • Aggregates data from microservices      │
│  • Falls back to local JSON storage        │
│  • Provides unified API interface          │
│  • Tracks data sources in responses        │
└────────┬────────────┬──────────────┬────────┘
         │            │              │
    ┌────▼───┐   ┌───▼────┐   ┌─────▼─────┐
    │ Habits │   │Training│   │   Video   │
    │Backend │   │Backend │   │Infrastructure│
    │NestJS  │   │ Flask  │   │    S3     │
    │:3000   │   │ :5000  │   │   :4000   │
    └────────┘   └────────┘   └───────────┘
         │            │              │
         └────────────┴──────────────┘
                      │
              ┌───────▼────────┐
              │  Local JSON    │
              │   (Fallback)   │
              └────────────────┘
```

## Technology Stack

- **Framework**: Express.js
- **Scheduling**: node-cron
- **HTTP Client**: Axios
- **Testing**: Jest + Supertest
- **Configuration**: dotenv

## Integration with External Services

The Dashboard Backend integrates with:

### 1. Habits Backend (NestJS + TypeORM)
- User habits and completions
- Streak tracking
- JWT authentication
- Branch: `feat-habits-backend-crud-streaks-api-templates-tests`

### 2. Training Backend (Flask + SQLAlchemy)
- Weekly training plans
- Workout completion tracking
- Training history
- Branch: `feat-training-backend-plans-workouts-trainer-assignment-endpoints`

### 3. Video Infrastructure (Planned)
- Exercise videos
- Content delivery
- Branch: `feat-video-ingest-s3-mediaconvert-signed-urls-drm-cdn-upload-service`

## Development Workflow

1. **Start External Services** (if needed):
   ```bash
   # Habits Backend (NestJS)
   cd habits-backend
   npm run start:dev

   # Training Backend (Flask)
   cd training-backend
   python run.py
   ```

2. **Start Dashboard Backend**:
   ```bash
   cd dashboard-backend
   npm run dev:integrated
   ```

3. **Test Integration**:
   ```bash
   curl http://localhost:3001/health
   ```

## Fallback Behavior

When external services are unavailable:
- Dashboard automatically falls back to local JSON data
- Logs the error
- Continues serving requests
- Marks response with `source: "local"`

This ensures the dashboard always works, even when services are down.

## API Response Format

All responses include source tracking:

```json
{
  "success": true,
  "data": {
    "habits": {
      "checklist": [...],
      "source": "habits-api"  // or "local"
    },
    "workouts": {
      "weeklyProgress": {...},
      "source": "training-api"  // or "local"
    },
    "integrations": {
      "habits": "habits-api",
      "workouts": "training-api"
    }
  }
}
```

## Monitoring

Check integration status:

```bash
curl http://localhost:3001/health
```

Response shows which services are enabled and their URLs.

## Acceptance Criteria

✅ API returns assembled dashboard payload  
✅ Unit tests cover data aggregation  
✅ Services deliver daily motivational content  
✅ Habit checklist definitions implemented  
✅ Weekly workout progress summary available  
✅ Quick links metadata provided  
✅ Scheduler rolls over habit list  
✅ Scheduler computes progress  
✅ Integration with Habits Backend (NestJS)  
✅ Integration with Training Backend (Flask)  
✅ Fallback to local data when services unavailable  
✅ Source tracking in responses  
✅ Configuration via environment variables  

**All acceptance criteria met! 🎉**

## License

ISC

## Version

**2.0.0** (Integrated) - Production Ready ✅

---

For detailed documentation, see the `backend/` directory.
