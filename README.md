# Content Library API

A comprehensive content backend API for managing articles with categories, tags, hero images, and Markdown/MDX body content. Features include search/filter endpoints, favorites, and personalization based on user preferences.

## Features

- **Article Management**: CRUD operations for articles with Markdown/MDX support
- **Categories & Tags**: Organize content with categories and tags
- **Search & Filtering**: Full-text search and multiple filter options
- **Pagination**: Efficient pagination for all list endpoints
- **Favorites**: Users can favorite articles
- **Personalization**: Content recommendations based on user goals, age, and skill level

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## API Endpoints

### Articles

#### Get All Articles (with filters and pagination)
```
GET /api/articles?page=1&limit=10&categories=1,2&tags=3&search=query&difficulty=beginner&goals=web-development&minAge=18&maxAge=60
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `categories` (string[]): Filter by category IDs
- `tags` (string[]): Filter by tag IDs
- `search` (string): Search in title, excerpt, and body
- `difficulty` (string): Filter by difficulty level (beginner/intermediate/advanced)
- `goals` (string[]): Filter by goals
- `minAge` (number): Minimum age for content
- `maxAge` (number): Maximum age for content
- `personalize` (boolean): Enable personalization
- `userId` (string): User ID for personalization
- `level` (string): User skill level
- `age` (number): User age
- `userGoals` (string[]): User goals

#### Get Personalized Articles
```
GET /api/articles/personalized/:userId?level=beginner&age=25&goals=web-development&page=1&limit=10
```

#### Search Articles
```
GET /api/articles/search?q=javascript&page=1&limit=10
```

#### Get Articles by Category
```
GET /api/articles/category/:categoryId?page=1&limit=10
```

#### Get Articles by Tag
```
GET /api/articles/tag/:tagId?page=1&limit=10
```

#### Get Article by ID
```
GET /api/articles/:id
```

#### Get Article by Slug
```
GET /api/articles/slug/:slug
```

#### Create Article
```
POST /api/articles
Content-Type: application/json

{
  "id": "unique-id",
  "title": "Article Title",
  "slug": "article-slug",
  "excerpt": "Short description",
  "body": "# Content in Markdown or MDX",
  "bodyFormat": "markdown",
  "heroImage": "/path/to/image.jpg",
  "categories": ["1", "2"],
  "tags": ["1", "3"],
  "author": "Author Name",
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "readTime": 5,
    "difficulty": "beginner",
    "goals": ["web-development"],
    "ageRange": {
      "min": 16,
      "max": 60
    }
  }
}
```

#### Update Article
```
PUT /api/articles/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Delete Article
```
DELETE /api/articles/:id
```

### Categories

#### Get All Categories
```
GET /api/categories
```

#### Get Category by ID
```
GET /api/categories/:id
```

#### Create Category
```
POST /api/categories
Content-Type: application/json

{
  "id": "unique-id",
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Category description"
}
```

### Tags

#### Get All Tags
```
GET /api/tags
```

#### Get Tag by ID
```
GET /api/tags/:id
```

#### Create Tag
```
POST /api/tags
Content-Type: application/json

{
  "id": "unique-id",
  "name": "Tag Name",
  "slug": "tag-slug"
}
```

### Favorites

#### Add Favorite
```
POST /api/favorites
Content-Type: application/json

{
  "userId": "user-id",
  "articleId": "article-id"
}
```

#### Remove Favorite
```
DELETE /api/favorites/:userId/:articleId
```

#### Get User Favorites
```
GET /api/favorites/:userId
```

#### Check if Article is Favorited
```
GET /api/favorites/:userId/:articleId
```

## Personalization Logic

The personalization algorithm scores articles based on:

1. **Skill Level Match** (+30 points): Articles matching user's skill level
2. **Age Appropriateness** (+20 points): Articles suitable for user's age range
3. **Goal Alignment** (+15 points per match): Articles matching user's goals

Articles are sorted by relevance score in descending order, ensuring the most relevant content appears first.

## Response Format

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Testing**: Jest
- **Content Format**: Markdown/MDX

## Architecture

```
src/
├── types/          # TypeScript type definitions
├── models/         # Data models and in-memory store
├── services/       # Business logic layer
├── controllers/    # Request handlers
├── routes/         # API route definitions
├── middleware/     # Express middleware
├── utils/          # Utility functions
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## License

ISC
