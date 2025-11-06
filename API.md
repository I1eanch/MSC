# Trainer Chat API Documentation

## Overview

This API provides real-time chat functionality between users and their assigned trainers using RESTful HTTP endpoints and WebSocket connections.

## Base URL

`http://localhost:3000`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

For WebSocket connections, include the token in the handshake:

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

## REST API Endpoints

### Authentication

#### POST /auth/login
Logs in a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "avatar": "optional-avatar-url"
  }
}
```

#### POST /auth/register
Registers a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user"
}
```

### Users

#### GET /users
Get all users (admin/trainer only).

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "avatar": "optional-avatar-url",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### GET /users/trainers
Get all trainers.

#### GET /users/:id
Get a specific user by ID.

#### POST /users/:id/assign-trainer/:trainerId
Assign a trainer to a user (admin only).

#### GET /users/:id/trainer
Get the assigned trainer for a user.

### Chat

#### POST /chat/conversations
Create or get a conversation between a user and trainer.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "trainerId": "trainer-uuid"
}
```

**Response:**
```json
{
  "id": "conversation-uuid",
  "userId": "user-uuid",
  "trainerId": "trainer-uuid",
  "status": "active",
  "isUserTyping": false,
  "isTrainerTyping": false,
  "lastMessageAt": "2023-01-01T00:00:00.000Z",
  "lastMessagePreview": "Hello!",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### GET /chat/conversations
Get all conversations for the authenticated user.

#### GET /chat/conversations/:id
Get a specific conversation by ID.

#### GET /chat/conversations/:id/messages
Get all messages in a conversation.

**Response:**
```json
[
  {
    "id": "message-uuid",
    "content": "Hello!",
    "type": "text",
    "isRead": false,
    "fileUrl": null,
    "fileName": null,
    "senderId": "sender-uuid",
    "receiverId": "receiver-uuid",
    "conversationId": "conversation-uuid",
    "sender": {
      "id": "sender-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "optional-avatar-url"
    },
    "receiver": {
      "id": "receiver-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "optional-avatar-url"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### POST /chat/messages
Send a new message.

**Request Body:**
```json
{
  "content": "Hello!",
  "type": "text",
  "conversationId": "conversation-uuid",
  "fileUrl": "optional-file-url",
  "fileName": "optional-file-name"
}
```

#### PUT /chat/messages/:id/read
Mark a message as read.

#### PUT /chat/conversations/:id/read
Mark all messages in a conversation as read.

#### GET /chat/messages/unread/count
Get the count of unread messages for the authenticated user.

**Response:**
```json
{
  "count": 5
}
```

### Admin

#### GET /chat/admin/conversations
Get all conversations for moderation (admin only).

#### PUT /chat/admin/conversations/:id/close
Close a conversation (admin only).

## WebSocket Events

### Client to Server Events

#### joinConversation
Join a conversation room.

**Data:**
```json
{
  "conversationId": "conversation-uuid"
}
```

#### sendMessage
Send a message to a conversation.

**Data:**
```json
{
  "conversationId": "conversation-uuid",
  "content": "Hello!",
  "type": "text",
  "fileUrl": "optional-file-url",
  "fileName": "optional-file-name"
}
```

#### typing
Send typing indicator.

**Data:**
```json
{
  "conversationId": "conversation-uuid",
  "isTyping": true
}
```

#### markAsRead
Mark a message as read.

**Data:**
```json
{
  "messageId": "message-uuid",
  "conversationId": "conversation-uuid"
}
```

#### leaveConversation
Leave a conversation room.

**Data:**
```json
{
  "conversationId": "conversation-uuid"
}
```

### Server to Client Events

#### conversationHistory
Conversation history when joining a room.

**Data:**
```json
{
  "conversationId": "conversation-uuid",
  "messages": [/* message objects */]
}
```

#### newMessage
New message received in conversation.

**Data:**
```json
{
  "id": "message-uuid",
  "content": "Hello!",
  "type": "text",
  "sender": {
    "id": "sender-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "optional-avatar-url"
  },
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### newMessageNotification
Push notification for new message (when user is not in conversation).

**Data:**
```json
{
  "conversationId": "conversation-uuid",
  "message": {
    "id": "message-uuid",
    "content": "Hello!",
    "sender": {
      "id": "sender-uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### userTyping
User typing indicator.

**Data:**
```json
{
  "conversationId": "conversation-uuid",
  "userId": "user-uuid",
  "userName": "John Doe",
  "isTyping": true
}
```

#### messageRead
Message read receipt.

**Data:**
```json
{
  "messageId": "message-uuid",
  "conversationId": "conversation-uuid",
  "readBy": "user-uuid"
}
```

#### userJoined
User joined conversation.

**Data:**
```json
{
  "userId": "user-uuid",
  "userName": "John Doe"
}
```

#### userLeft
User left conversation.

**Data:**
```json
{
  "userId": "user-uuid",
  "userName": "John Doe"
}
```

#### error
Error message.

**Data:**
```json
{
  "message": "Error description"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 10 requests per minute per IP address
- WebSocket connections also limited

## Example Usage

### JavaScript/Node.js Client Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user1@example.com',
    password: 'password123'
  })
});
const { access_token } = await loginResponse.json();

// WebSocket connection
const socket = io('http://localhost:3000', {
  auth: { token: access_token }
});

// Join conversation
socket.emit('joinConversation', {
  conversationId: 'conversation-uuid'
});

// Send message
socket.emit('sendMessage', {
  conversationId: 'conversation-uuid',
  content: 'Hello!',
  type: 'text'
});

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});
```

### Test Users

The seed script creates the following test users:

- **Admin**: admin@example.com / password123
- **Trainer 1**: trainer1@example.com / password123
- **Trainer 2**: trainer2@example.com / password123
- **User 1**: user1@example.com / password123
- **User 2**: user2@example.com / password123

## Development Setup

1. Install dependencies: `npm install`
2. Set up PostgreSQL and Redis
3. Copy `.env.example` to `.env` and configure
4. Run seed script: `npm run seed`
5. Start development server: `npm run start:dev`
6. Visit API docs: `http://localhost:3000/api`