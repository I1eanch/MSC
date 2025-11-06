# Trainer Chat Backend

A NestJS backend application providing real-time chat functionality between users and their assigned trainers using WebSockets, with PostgreSQL for persistence and Redis for caching.

## Features

- **Real-time Chat**: WebSocket-based messaging with Socket.IO
- **User Authentication**: JWT-based authentication with role-based access control
- **Message Persistence**: All messages stored in PostgreSQL database
- **Conversation Management**: 1:1 conversations between users and trainers
- **Typing Indicators**: Real-time typing status updates
- **Read Receipts**: Message read status tracking
- **Admin Moderation**: Tools for administrators to monitor and moderate conversations
- **Push Notifications**: Real-time notifications for new messages
- **File Sharing**: Support for file attachments (images, documents)
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **API Documentation**: Auto-generated Swagger documentation

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Real-time**: Socket.IO WebSockets
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker and Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Database Setup:
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres redis
   
   # Or manually setup PostgreSQL and Redis
   ```

5. Run database migrations and seed data:
   ```bash
   npm run seed
   ```

6. Start the application:
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

### Docker Setup

For a complete development environment with Docker:

```bash
# Start all services (app, postgres, redis)
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## API Documentation

Once the application is running, visit `http://localhost:3000/api` to view the interactive Swagger documentation.

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users

- `GET /users` - Get all users (admin/trainer only)
- `GET /users/trainers` - Get all trainers
- `GET /users/:id` - Get user by ID
- `POST /users/:id/assign-trainer/:trainerId` - Assign trainer to user (admin only)

### Chat

- `POST /chat/conversations` - Create or get conversation
- `GET /chat/conversations` - Get user conversations
- `GET /chat/conversations/:id` - Get conversation by ID
- `GET /chat/conversations/:id/messages` - Get conversation messages
- `POST /chat/messages` - Send message
- `PUT /chat/messages/:id/read` - Mark message as read
- `PUT /chat/conversations/:id/read` - Mark conversation as read
- `GET /chat/messages/unread/count` - Get unread message count

### Admin

- `GET /chat/admin/conversations` - Get all conversations for moderation
- `PUT /chat/admin/conversations/:id/close` - Close conversation

## WebSocket Events

### Client to Server

- `joinConversation` - Join a conversation room
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `markAsRead` - Mark message as read
- `leaveConversation` - Leave conversation room

### Server to Client

- `conversationHistory` - Conversation messages history
- `newMessage` - New message received
- `newMessageNotification` - Push notification for new message
- `userTyping` - User typing indicator
- `messageRead` - Message read receipt
- `userJoined` - User joined conversation
- `userLeft` - User left conversation
- `error` - Error message

## Authentication

WebSocket connections require JWT authentication. Include the token in the connection handshake:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## User Roles

- **USER**: Regular user who can chat with assigned trainer
- **TRAINER**: Trainer who can chat with assigned users
- **ADMIN**: Administrator with full access to all conversations

## Database Schema

### Users
- id (UUID, Primary Key)
- email (string, unique)
- password (string, hashed)
- firstName (string)
- lastName (string)
- role (enum: user, trainer, admin)
- avatar (string, optional)
- isActive (boolean)
- assignedTrainerId (UUID, optional)
- timestamps

### Conversations
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- trainerId (UUID, Foreign Key)
- status (enum: active, archived, closed)
- isUserTyping (boolean)
- isTrainerTyping (boolean)
- lastMessageAt (timestamp)
- lastMessagePreview (string)
- timestamps

### Messages
- id (UUID, Primary Key)
- content (string)
- type (enum: text, image, file, system)
- isRead (boolean)
- fileUrl (string, optional)
- fileName (string, optional)
- senderId (UUID, Foreign Key)
- receiverId (UUID, Foreign Key)
- conversationId (UUID, Foreign Key)
- timestamps

## Development

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USERNAME | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | password |
| DB_NAME | Database name | trainer_chat |
| JWT_SECRET | JWT secret key | your-secret-key |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| PORT | Application port | 3000 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | * |

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- WebSocket authentication guard

## Production Deployment

1. Set secure environment variables
2. Use HTTPS
3. Configure proper CORS origins
4. Set up database connection pooling
5. Configure Redis clustering for high availability
6. Set up proper logging and monitoring
7. Use process managers like PM2

## License

This project is licensed under the ISC License.