# Quick Start Guide

## Installation

```bash
cd backend
npm install
```

## Running Modes

### 1. Local Mode (Standalone)

Best for development without external services:

```bash
npm start
# or
npm run dev
```

- Runs on **port 3000**
- Uses local JSON data
- No external dependencies
- Perfect for testing

**Test it:**
```bash
curl http://localhost:3000/api/dashboard
```

### 2. Integrated Mode (With External Services)

For production with microservices:

```bash
npm run start:integrated
# or
npm run dev:integrated
```

- Runs on **port 3001**
- Connects to external services
- Falls back to local data if services unavailable
- Production-ready

**Test it:**
```bash
curl http://localhost:3001/health
```

## Configuration

### Enable Integrations

Create `.env` file:

```env
# Server
PORT=3001

# Enable services
ENABLE_HABITS_INTEGRATION=true
ENABLE_TRAINING_INTEGRATION=true

# Service URLs
HABITS_API_URL=http://localhost:3000
TRAINING_API_URL=http://localhost:5000

# Fallback
FALLBACK_MODE=true
```

## Using the API

### Get Complete Dashboard

```bash
# Local mode
curl http://localhost:3000/api/dashboard

# Integrated mode (with auth)
curl http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-user-id: 123"
```

### Get Habits

```bash
# Local mode
curl http://localhost:3000/api/dashboard/habits

# Integrated mode (requires auth)
curl http://localhost:3001/api/dashboard/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-user-id: 123"
```

### Toggle Habit

```bash
# Local mode
curl -X POST http://localhost:3000/api/dashboard/habits/1/toggle

# Integrated mode
curl -X POST http://localhost:3001/api/dashboard/habits/1/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-user-id: 123"
```

### Get Training Plan

```bash
# Integrated mode only
curl http://localhost:3001/api/dashboard/workouts/plan \
  -H "x-user-id: 123"
```

### Get Training History

```bash
# Integrated mode only
curl http://localhost:3001/api/dashboard/workouts/history?limit=5 \
  -H "x-user-id: 123"
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/integration.test.js
```

## Checking Integration Status

```bash
curl http://localhost:3001/health
```

Response shows which services are enabled:
```json
{
  "status": "healthy",
  "integrations": {
    "habits": {
      "enabled": true,
      "url": "http://localhost:3000"
    },
    "training": {
      "enabled": true,
      "url": "http://localhost:5000"
    }
  },
  "fallbackMode": true
}
```

## Understanding Responses

All responses include source information:

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
    }
  }
}
```

**Source values:**
- `habits-api` - Data from Habits Backend
- `training-api` - Data from Training Backend
- `local` - Data from local JSON files

## Common Scenarios

### Scenario 1: Development

```bash
# Use local mode for fast iteration
npm run dev
```

No external services needed!

### Scenario 2: Integration Testing

```bash
# Start external services first
# Then run integrated mode
npm run dev:integrated
```

### Scenario 3: Service Unavailable

If external service fails:
- Dashboard automatically falls back to local data
- Response includes `source: "local"`
- Check logs for error details

### Scenario 4: Production Deployment

```bash
# Set environment variables
export ENABLE_HABITS_INTEGRATION=true
export ENABLE_TRAINING_INTEGRATION=true
export HABITS_API_URL=https://habits-api.example.com
export TRAINING_API_URL=https://training-api.example.com
export FALLBACK_MODE=true

# Run integrated mode
npm run start:integrated
```

## Troubleshooting

### Port already in use

```bash
# Change port in .env
PORT=3002

# Or kill existing process
lsof -ti:3001 | xargs kill -9
```

### External service not connecting

1. Check service is running:
   ```bash
   curl http://localhost:3000/health  # Habits
   curl http://localhost:5000/health  # Training
   ```

2. Check `.env` configuration

3. Check logs for connection errors

4. Verify `FALLBACK_MODE=true` for graceful degradation

### Tests failing

```bash
# Ensure data directory exists
mkdir -p backend/data

# Clear cache and re-run
rm -rf node_modules
npm install
npm test
```

## Next Steps

- Read [README_INTEGRATED.md](./README_INTEGRATED.md) for full documentation
- Read [INTEGRATION.md](./INTEGRATION.md) for integration details
- Check [API documentation](./README.md#api-endpoints) for all endpoints
- Review `.env.example` for all configuration options

## Need Help?

- Check logs for detailed error messages
- Use `/health` endpoint to verify service status
- Ensure external services are running and accessible
- Verify JWT tokens are valid (for Habits API)
- Check that `FALLBACK_MODE=true` for development
