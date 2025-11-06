# API Usage Examples

This document provides practical examples of using the Content Library API.

## Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will be available at `http://localhost:3000`

## Example API Calls

### 1. Get All Articles (Basic)

```bash
curl http://localhost:3000/api/articles
```

Response:
```json
{
  "data": [
    {
      "id": "1",
      "title": "Introduction to JavaScript",
      "slug": "intro-to-javascript",
      "excerpt": "Learn the basics of JavaScript programming",
      "body": "# Introduction to JavaScript\n\nJavaScript is a versatile programming language...",
      "bodyFormat": "markdown",
      "heroImage": "/images/js-intro.jpg",
      "categories": ["1", "3"],
      "tags": ["1", "3", "4"],
      "author": "John Doe",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "metadata": {
        "readTime": 5,
        "difficulty": "beginner",
        "goals": ["learn-programming", "web-development"],
        "ageRange": { "min": 16, "max": 60 }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 2. Paginated Articles

```bash
curl "http://localhost:3000/api/articles?page=1&limit=2"
```

### 3. Filter by Category

```bash
curl "http://localhost:3000/api/articles?categories=1"
```

### 4. Filter by Multiple Categories

```bash
curl "http://localhost:3000/api/articles?categories=1&categories=2"
```

### 5. Filter by Tags

```bash
curl "http://localhost:3000/api/articles?tags=4"
```

### 6. Filter by Difficulty Level

```bash
curl "http://localhost:3000/api/articles?difficulty=beginner"
```

### 7. Search Articles

```bash
curl "http://localhost:3000/api/articles/search?q=JavaScript"
```

### 8. Filter by Age Range

```bash
curl "http://localhost:3000/api/articles?minAge=18&maxAge=30"
```

### 9. Filter by Goals

```bash
curl "http://localhost:3000/api/articles?goals=web-development&goals=learn-programming"
```

### 10. Get Personalized Articles

```bash
curl "http://localhost:3000/api/articles/personalized/user123?level=beginner&age=25&goals=web-development"
```

This endpoint returns articles sorted by relevance score based on:
- User's skill level (beginner/intermediate/advanced)
- User's age
- User's learning goals

### 11. Combined Filters with Personalization

```bash
curl "http://localhost:3000/api/articles?categories=1&difficulty=beginner&personalize=true&userId=user123&level=beginner&age=25&userGoals=web-development"
```

### 12. Get Articles by Category

```bash
curl "http://localhost:3000/api/articles/category/1"
```

### 13. Get Articles by Tag

```bash
curl "http://localhost:3000/api/articles/tag/4"
```

### 14. Get Single Article by ID

```bash
curl "http://localhost:3000/api/articles/1"
```

### 15. Get Single Article by Slug

```bash
curl "http://localhost:3000/api/articles/slug/intro-to-javascript"
```

### 16. Get All Categories

```bash
curl "http://localhost:3000/api/categories"
```

### 17. Get All Tags

```bash
curl "http://localhost:3000/api/tags"
```

### 18. Add Article to Favorites

```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "articleId": "1"
  }'
```

### 19. Get User's Favorite Articles

```bash
curl "http://localhost:3000/api/favorites/user123"
```

### 20. Check if Article is Favorited

```bash
curl "http://localhost:3000/api/favorites/user123/1"
```

Response:
```json
{
  "isFavorite": true
}
```

### 21. Remove from Favorites

```bash
curl -X DELETE "http://localhost:3000/api/favorites/user123/1"
```

### 22. Create New Article

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "5",
    "title": "Advanced React Patterns",
    "slug": "advanced-react-patterns",
    "excerpt": "Learn advanced React patterns and best practices",
    "body": "# Advanced React Patterns\n\nIn this article, we explore...",
    "bodyFormat": "mdx",
    "heroImage": "/images/react-advanced.jpg",
    "categories": ["1"],
    "tags": ["1", "5"],
    "author": "Jane Developer",
    "publishedAt": "2024-03-01T00:00:00.000Z",
    "updatedAt": "2024-03-01T00:00:00.000Z",
    "metadata": {
      "readTime": 20,
      "difficulty": "advanced",
      "goals": ["advanced-programming", "web-development"],
      "ageRange": { "min": 20, "max": 60 }
    }
  }'
```

### 23. Update Article

```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to JavaScript - Updated"
  }'
```

### 24. Delete Article

```bash
curl -X DELETE "http://localhost:3000/api/articles/5"
```

## Common Use Cases

### Use Case 1: Building a Personalized Learning Platform

For a user who is:
- 22 years old
- Beginner level
- Interested in web development and learning programming

```bash
curl "http://localhost:3000/api/articles/personalized/user123?level=beginner&age=22&goals=web-development&goals=learn-programming&page=1&limit=5"
```

### Use Case 2: Age-Appropriate Content Filtering

Get content suitable for teenagers (13-19):

```bash
curl "http://localhost:3000/api/articles?minAge=13&maxAge=19&page=1&limit=10"
```

### Use Case 3: Category-Based Content Discovery

Get all technology articles for beginners:

```bash
curl "http://localhost:3000/api/articles?categories=1&difficulty=beginner"
```

### Use Case 4: Full-Text Search with Filters

Search for "fitness" in beginner-level content:

```bash
curl "http://localhost:3000/api/articles?search=fitness&difficulty=beginner"
```

### Use Case 5: User's Reading List

Get a user's favorite articles (their reading list):

```bash
curl "http://localhost:3000/api/favorites/user123"
```

## Testing Personalization

To understand how personalization scoring works, try these examples:

1. **Exact Match** (highest score):
```bash
curl "http://localhost:3000/api/articles/personalized/user123?level=beginner&age=20&goals=learn-programming&goals=web-development"
```

2. **Partial Match** (medium score):
```bash
curl "http://localhost:3000/api/articles/personalized/user123?level=beginner"
```

3. **Age-Only Match** (lower score):
```bash
curl "http://localhost:3000/api/articles/personalized/user123?age=25"
```

The articles will be sorted by relevance score, with the most relevant content appearing first.

## Response Format

All list endpoints return a paginated response:

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

## Error Handling

### 404 Not Found
```json
{
  "error": "Article not found"
}
```

### 400 Bad Request
```json
{
  "error": "userId and articleId are required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!"
}
```

## Health Check

Check if the API is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-01T12:00:00.000Z"
}
```
