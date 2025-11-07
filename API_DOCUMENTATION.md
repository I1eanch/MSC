# Courses Backend API Documentation

## Overview
The Courses Backend API provides comprehensive course management, enrollment, and progress tracking functionality with support for prerequisites and video content.

## Base URL
```
/api/
```

## Authentication
All endpoints require authentication. The API uses Django session authentication. Include valid session credentials in requests.

---

## Course Management

### List Courses
**Endpoint:** `GET /api/courses/`

**Description:** List all published courses (staff users see all courses including drafts).

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "description": "Learn Python fundamentals",
      "instructor": {
        "id": 1,
        "username": "instructor1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "instructor1@example.com"
      },
      "status": "published",
      "thumbnail_url": "https://example.com/thumbnail.jpg",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Course Details
**Endpoint:** `GET /api/courses/{id}/`

**Description:** Get detailed information about a specific course including modules and prerequisites.

**Response:**
```json
{
  "id": 1,
  "title": "Python Basics",
  "description": "Learn Python fundamentals",
  "instructor": {...},
  "status": "published",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "modules": [
    {
      "id": 1,
      "course": 1,
      "title": "Module 1: Introduction",
      "description": "Course introduction",
      "order": 1,
      "lessons": [...]
    }
  ],
  "prerequisites": [
    {
      "id": 1,
      "course": 1,
      "prerequisite_type": "course",
      "prerequisite_course": 2,
      "prerequisite_module": null,
      "prerequisite_lesson": null,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Create Course
**Endpoint:** `POST /api/courses/` (Admin/Staff only)

**Request Body:**
```json
{
  "title": "Advanced Python",
  "description": "Advanced Python concepts",
  "status": "published",
  "thumbnail_url": "https://example.com/thumbnail.jpg"
}
```

**Response:** 201 Created with course object

### Update Course
**Endpoint:** `PUT /api/courses/{id}/` (Admin/Staff only)

### Delete Course
**Endpoint:** `DELETE /api/courses/{id}/` (Admin/Staff only)

---

## Enrollment

### Enroll in Course
**Endpoint:** `POST /api/courses/{id}/enroll/`

**Description:** Enroll the authenticated user in a course. Prerequisites must be met.

**Response:**
```json
{
  "id": 1,
  "user": {...},
  "course": {...},
  "status": "active",
  "enrolled_at": "2024-01-15T10:00:00Z",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": null
}
```

**Error (Prerequisites not met):** 400 Bad Request
```json
{
  "detail": "Prerequisite not met: Complete Course"
}
```

### Check Enrollment Status
**Endpoint:** `GET /api/courses/{id}/is_user_enrolled/`

**Response:**
```json
{
  "is_enrolled": true,
  "enrollment_status": "active"
}
```

### Check Prerequisites
**Endpoint:** `GET /api/courses/{id}/prerequisites_met/`

**Response:**
```json
{
  "all_met": false,
  "unmet_prerequisites": [
    {
      "type": "Complete Course",
      "description": "Python Basics"
    }
  ]
}
```

### List User Enrollments
**Endpoint:** `GET /api/enrollments/`

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": {...},
      "course": {...},
      "status": "active",
      "enrolled_at": "2024-01-15T10:00:00Z",
      "started_at": "2024-01-15T10:00:00Z",
      "completed_at": null
    }
  ]
}
```

### Mark Enrollment as Started
**Endpoint:** `POST /api/enrollments/{id}/mark_started/`

### Mark Enrollment as Completed
**Endpoint:** `POST /api/enrollments/{id}/mark_completed/`

### Unenroll from Course
**Endpoint:** `DELETE /api/enrollments/{id}/`

---

## Lesson Progress Tracking

### Create Lesson Progress
**Endpoint:** `POST /api/lesson-progress/`

**Request Body:**
```json
{
  "lesson": 1,
  "is_viewed": false,
  "watch_duration": 0,
  "watch_percentage": 0
}
```

**Response:** 201 Created

### Update Video Watch Progress
**Endpoint:** `POST /api/lesson-progress/{id}/update_watch_progress/`

**Description:** Update the watch duration and percentage for a video lesson.

**Request Body:**
```json
{
  "watch_duration": 300,
  "watch_percentage": 50
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "lesson": 1,
  "lesson_title": "Introduction to Python",
  "is_viewed": true,
  "watch_duration": 300,
  "watch_percentage": 50,
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": null,
  "last_accessed_at": "2024-01-15T10:05:00Z"
}
```

**Side Effect:** Updates course progress automatically

### Mark Lesson as Completed
**Endpoint:** `POST /api/lesson-progress/{id}/mark_completed/`

**Description:** Mark a lesson as completed (100% watched).

**Response:**
```json
{
  "id": 1,
  "watch_percentage": 100,
  "completed_at": "2024-01-15T10:05:00Z",
  ...
}
```

**Side Effect:** Updates course progress to reflect completion

### List Lesson Progress
**Endpoint:** `GET /api/lesson-progress/`

---

## Course Progress Tracking (Read-only)

### List Course Progress
**Endpoint:** `GET /api/course-progress/`

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "user": 1,
      "course": 1,
      "course_title": "Python Basics",
      "lessons_completed": 5,
      "total_lessons": 10,
      "completion_percentage": 50,
      "started_at": "2024-01-15T10:00:00Z",
      "completed_at": null,
      "last_accessed_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Course Progress Details
**Endpoint:** `GET /api/course-progress/{id}/`

**Response:** Single course progress object (same structure as above)

---

## Modules Management

### List Modules
**Endpoint:** `GET /api/modules/?course={course_id}`

**Query Parameters:**
- `course` (optional): Filter by course ID

### Get Module Details
**Endpoint:** `GET /api/modules/{id}/`

**Response:**
```json
{
  "id": 1,
  "course": 1,
  "title": "Module 1: Introduction",
  "description": "Course introduction and setup",
  "order": 1,
  "lessons": [
    {
      "id": 1,
      "module": 1,
      "title": "Welcome Video",
      "description": "Course introduction",
      "order": 1,
      "lesson_type": "video",
      "video_url": "https://example.com/video1.mp4",
      "video_duration": 600,
      "content": null,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Create Module
**Endpoint:** `POST /api/modules/` (Admin/Staff only)

**Request Body:**
```json
{
  "course": 1,
  "title": "Module 1: Introduction",
  "description": "Course introduction",
  "order": 1
}
```

### Update Module
**Endpoint:** `PUT /api/modules/{id}/` (Admin/Staff only)

### Delete Module
**Endpoint:** `DELETE /api/modules/{id}/` (Admin/Staff only)

---

## Lessons Management

### List Lessons
**Endpoint:** `GET /api/lessons/?module={module_id}`

**Query Parameters:**
- `module` (optional): Filter by module ID

### Get Lesson Details
**Endpoint:** `GET /api/lessons/{id}/`

### Create Lesson
**Endpoint:** `POST /api/lessons/` (Admin/Staff only)

**Request Body:**
```json
{
  "module": 1,
  "title": "Introduction to Python",
  "description": "Basic Python concepts",
  "order": 1,
  "lesson_type": "video",
  "video_url": "https://example.com/video.mp4",
  "video_duration": 600,
  "content": null
}
```

**Lesson Types:**
- `video`: Video content
- `text`: Text-based content
- `quiz`: Quiz/assessment

### Update Lesson
**Endpoint:** `PUT /api/lessons/{id}/` (Admin/Staff only)

### Delete Lesson
**Endpoint:** `DELETE /api/lessons/{id}/` (Admin/Staff only)

---

## Prerequisites Management

### List Prerequisites
**Endpoint:** `GET /api/prerequisites/?course={course_id}`

**Query Parameters:**
- `course` (optional): Filter by course ID

### Get Prerequisite Details
**Endpoint:** `GET /api/prerequisites/{id}/`

**Response:**
```json
{
  "id": 1,
  "course": 2,
  "prerequisite_type": "course",
  "prerequisite_course": 1,
  "prerequisite_module": null,
  "prerequisite_lesson": null,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Create Prerequisite
**Endpoint:** `POST /api/prerequisites/` (Admin/Staff only)

**Request Body:**
```json
{
  "course": 2,
  "prerequisite_type": "course",
  "prerequisite_course": 1,
  "prerequisite_module": null,
  "prerequisite_lesson": null
}
```

**Prerequisite Types:**
- `course`: User must complete an entire course
- `module`: User must complete all lessons in a module
- `lesson`: User must complete a specific lesson

### Update Prerequisite
**Endpoint:** `PUT /api/prerequisites/{id}/` (Admin/Staff only)

### Delete Prerequisite
**Endpoint:** `DELETE /api/prerequisites/{id}/` (Admin/Staff only)

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

Common HTTP Status Codes:
- `200 OK`: Successful GET/POST/PUT request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Server Error`: Internal server error

---

## Pagination

List endpoints support pagination with the following parameters:

**Query Parameters:**
- `page` (default: 1): Page number
- `page_size` (default: 20): Items per page

**Response includes:**
- `count`: Total number of items
- `next`: URL to next page (if available)
- `previous`: URL to previous page (if available)
- `results`: Array of items

---

## Database Migrations

### Running Migrations
```bash
python manage.py migrate
```

### Creating New Migrations
```bash
python manage.py makemigrations
```

---

## Models Overview

### Course
- Fields: id, title, description, instructor, status, thumbnail_url, created_at, updated_at
- Status choices: draft, published, archived

### Module
- Fields: id, course, title, description, order, created_at, updated_at
- Belongs to: Course

### Lesson
- Fields: id, module, title, description, order, lesson_type, video_url, video_duration, content, created_at, updated_at
- Types: video, text, quiz
- Belongs to: Module

### Enrollment
- Fields: id, user, course, status, enrolled_at, started_at, completed_at
- Status choices: active, completed, dropped, paused
- Unique constraint: (user, course)

### LessonProgress
- Fields: id, user, lesson, is_viewed, watch_duration, watch_percentage, started_at, completed_at, last_accessed_at
- Unique constraint: (user, lesson)

### CourseProgress
- Fields: id, user, course, lessons_completed, total_lessons, completion_percentage, started_at, completed_at, last_accessed_at
- Unique constraint: (user, course)

### Prerequisite
- Fields: id, course, prerequisite_type, prerequisite_course, prerequisite_module, prerequisite_lesson, created_at
- Types: course, module, lesson

---

## Testing

### Running Tests
```bash
# Run all tests
python manage.py test courses

# Run specific test class
python manage.py test courses.tests.CourseAPITestCase

# Run specific test
python manage.py test courses.tests.CourseAPITestCase.test_list_published_courses

# Run with verbose output
python manage.py test courses -v 2
```

### Test Coverage
- Model tests: 13 tests
- API tests: 21 tests
- Total: 34 comprehensive tests

---

## Video Infrastructure Integration

### Video URL Format
Videos are stored as URLs that point to external video hosting services. The system supports:
- HTTP/HTTPS video URLs
- Any standard video hosting service (YouTube, Vimeo, S3, etc.)

### Video Duration
- Stored in seconds
- Used for progress tracking and calculations

### Video Progress Tracking
- Watch percentage: 0-100 (calculated automatically)
- Watch duration: Actual seconds watched
- Automatic completion: When watch_percentage reaches 100%

---

## Example Workflow: Enrolling and Tracking Progress

1. **Enroll in Course**
   ```
   POST /api/courses/1/enroll/
   ```

2. **Get First Lesson**
   ```
   GET /api/courses/1/
   # Extract first lesson ID from modules[0].lessons[0]
   ```

3. **Create Lesson Progress**
   ```
   POST /api/lesson-progress/
   {
     "lesson": 1,
     "is_viewed": false,
     "watch_duration": 0,
     "watch_percentage": 0
   }
   ```

4. **Update Progress as User Watches**
   ```
   POST /api/lesson-progress/1/update_watch_progress/
   {
     "watch_duration": 300,
     "watch_percentage": 50
   }
   ```

5. **Mark Lesson Complete**
   ```
   POST /api/lesson-progress/1/mark_completed/
   ```

6. **Check Course Progress**
   ```
   GET /api/course-progress/
   ```

---

## Performance Considerations

- Course progress is automatically updated when lessons are completed
- Prerequisite checking is performed at enrollment time
- Database queries are optimized with select_related and prefetch_related
- Pagination is implemented for all list endpoints

---

## Future Enhancements

- Real-time progress notifications
- Certificate generation
- Advanced analytics and reporting
- Recommendation engine
- Social features (comments, discussions)
- File upload support for lessons
- Grading system for quizzes
