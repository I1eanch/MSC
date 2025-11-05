# Video Infrastructure API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health Check

#### GET /health
Check service health status.

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### Register User

#### POST /api/auth/register
Register a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "trainer1",
  "email": "trainer@example.com",
  "password": "securePassword123",
  "role": "trainer"
}
```

**Validation:**
- `username`: String, min 3 characters
- `email`: Valid email format
- `password`: String, min 6 characters
- `role`: Optional, defaults to "trainer"

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Error Responses:**
- `400`: Validation errors
- `409`: User already exists

---

### Login

#### POST /api/auth/login
Authenticate and receive JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "trainer@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "trainer1",
    "email": "trainer@example.com",
    "role": "trainer"
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Invalid credentials

---

## Video Endpoints

### Upload Video

#### POST /api/videos/upload
Upload a video file for processing.

**Authentication:** Required (Trainer or Admin role)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `video`: File (required) - Video file to upload
  - Max size: 5GB
  - Allowed formats: MP4, MPEG, MOV, AVI, MKV, WEBM
- `title`: String (required) - Video title
- `description`: String (optional) - Video description

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@/path/to/video.mp4" \
  -F "title=Training Session 1" \
  -F "description=Basic training techniques"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'Training Session 1');
formData.append('description', 'Basic training techniques');

fetch('http://localhost:3000/api/videos/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Success Response (201):**
```json
{
  "message": "Video uploaded successfully",
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "transcoding",
  "jobId": "1234567890123-abcdef"
}
```

**Error Responses:**
- `400`: No file provided or validation errors
- `401`: Authentication required
- `403`: Insufficient permissions
- `413`: File too large

---

### List Videos

#### GET /api/videos
Retrieve a list of videos for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `status`: String (optional) - Filter by status (uploaded, transcoding, completed, failed)
- `limit`: Number (optional, default: 50) - Number of results to return
- `offset`: Number (optional, default: 0) - Number of results to skip

**Example:**
```
GET /api/videos?status=completed&limit=10&offset=0
```

**Success Response (200):**
```json
{
  "videos": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Training Session 1",
      "description": "Basic training techniques",
      "status": "completed",
      "duration": 320.5,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "limit": 10,
  "offset": 0
}
```

**Error Responses:**
- `401`: Authentication required

---

### Get Video Details

#### GET /api/videos/:id
Retrieve detailed information about a specific video.

**Authentication:** Required

**URL Parameters:**
- `id`: String (required) - Video UUID

**Example:**
```
GET /api/videos/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Success Response (200):**
```json
{
  "video": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": 1,
    "title": "Training Session 1",
    "description": "Basic training techniques",
    "original_filename": "training-video.mp4",
    "s3_key": "uploads/a1b2c3d4-e5f6-7890.mp4",
    "s3_bucket": "video-uploads-bucket",
    "file_size": 104857600,
    "duration": 320.5,
    "status": "completed",
    "mediaconvert_job_id": "1234567890123-abcdef",
    "thumbnail_url": "https://cdn.example.com/thumbnails/.../thumbnail.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "outputs": [
    {
      "id": 1,
      "video_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "format": "hls",
      "resolution": "1080p",
      "s3_key": "hls/a1b2c3d4-e5f6-7890/index_1080p.m3u8",
      "s3_bucket": "video-processed-bucket",
      "cloudfront_url": "https://cdn.example.com/hls/.../index_1080p.m3u8",
      "file_size": 52428800,
      "bitrate": 5000000,
      "created_at": "2024-01-15T10:35:00.000Z"
    },
    {
      "id": 2,
      "video_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "format": "hls",
      "resolution": "720p",
      "s3_key": "hls/a1b2c3d4-e5f6-7890/index_720p.m3u8",
      "s3_bucket": "video-processed-bucket",
      "cloudfront_url": "https://cdn.example.com/hls/.../index_720p.m3u8",
      "file_size": 31457280,
      "bitrate": 3000000,
      "created_at": "2024-01-15T10:35:00.000Z"
    },
    {
      "id": 3,
      "video_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "format": "hls",
      "resolution": "480p",
      "s3_key": "hls/a1b2c3d4-e5f6-7890/index_480p.m3u8",
      "s3_bucket": "video-processed-bucket",
      "cloudfront_url": "https://cdn.example.com/hls/.../index_480p.m3u8",
      "file_size": 15728640,
      "bitrate": 1500000,
      "created_at": "2024-01-15T10:35:00.000Z"
    },
    {
      "id": 4,
      "video_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "format": "mp4",
      "resolution": "1080p",
      "s3_key": "mp4/a1b2c3d4-e5f6-7890/output_1080p.mp4",
      "s3_bucket": "video-processed-bucket",
      "cloudfront_url": "https://cdn.example.com/mp4/.../output_1080p.mp4",
      "file_size": 104857600,
      "bitrate": 5000000,
      "created_at": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: Access denied (not video owner)
- `404`: Video not found

---

### Get Signed Streaming URL

#### GET /api/videos/:id/signed-url
Generate a signed URL for secure video streaming.

**Authentication:** Required

**URL Parameters:**
- `id`: String (required) - Video UUID

**Query Parameters:**
- `format`: String (optional, default: "hls") - Output format (hls, mp4)
- `resolution`: String (optional, default: "1080p") - Video resolution (1080p, 720p, 480p)

**Example:**
```
GET /api/videos/a1b2c3d4-e5f6-7890/signed-url?format=hls&resolution=1080p
```

**Success Response (200):**
```json
{
  "signedUrl": "https://cdn.example.com/hls/.../index_1080p.m3u8?Policy=eyJ...&Signature=abc...&Key-Pair-Id=APKA...",
  "drmToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "format": "hls",
  "resolution": "1080p"
}
```

**Response Fields:**
- `signedUrl`: Time-limited CloudFront signed URL
- `drmToken`: DRM token for playback authorization
- `expiresIn`: URL expiry time in seconds
- `format`: Requested format
- `resolution`: Requested resolution

**Error Responses:**
- `400`: Video not ready for streaming
- `401`: Authentication required
- `403`: Access denied
- `404`: Video or output not found

---

### Get Transcoding Status

#### GET /api/videos/:id/status
Check the transcoding status of a video.

**Authentication:** Required

**URL Parameters:**
- `id`: String (required) - Video UUID

**Example:**
```
GET /api/videos/a1b2c3d4-e5f6-7890/status
```

**Success Response (200):**
```json
{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "transcoding",
  "progress": 45,
  "jobId": "1234567890123-abcdef"
}
```

**Status Values:**
- `uploaded`: Video uploaded, waiting for transcoding
- `transcoding`: Currently being transcoded
- `completed`: Transcoding finished successfully
- `failed`: Transcoding failed
- `canceled`: Transcoding was canceled

**Error Responses:**
- `401`: Authentication required
- `403`: Access denied
- `404`: Video not found

---

### Delete Video

#### DELETE /api/videos/:id
Delete a video and all its outputs.

**Authentication:** Required (Trainer or Admin role)

**URL Parameters:**
- `id`: String (required) - Video UUID

**Example:**
```
DELETE /api/videos/a1b2c3d4-e5f6-7890
```

**Success Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: Insufficient permissions
- `404`: Video not found

---

## Video Streaming Integration

### HLS Streaming with Signed URLs

#### HTML5 + HLS.js Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Secure Video Player</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    #video { width: 100%; max-width: 1280px; }
  </style>
</head>
<body>
  <video id="video" controls></video>
  
  <script>
    const API_BASE = 'http://localhost:3000/api';
    const videoId = 'a1b2c3d4-e5f6-7890';
    const token = 'your-jwt-token';
    
    // Fetch signed URL
    fetch(`${API_BASE}/videos/${videoId}/signed-url?format=hls&resolution=1080p`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const video = document.getElementById('video');
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: function(xhr, url) {
            xhr.setRequestHeader('X-DRM-Token', data.drmToken);
          }
        });
        hls.loadSource(data.signedUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = data.signedUrl;
        video.addEventListener('loadedmetadata', function() {
          video.play();
        });
      }
    });
  </script>
</body>
</html>
```

#### React Example

```jsx
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

function VideoPlayer({ videoId, token }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    const loadVideo = async () => {
      const response = await fetch(
        `http://localhost:3000/api/videos/${videoId}/signed-url?format=hls&resolution=1080p`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const { signedUrl, drmToken } = await response.json();
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr, url) => {
            xhr.setRequestHeader('X-DRM-Token', drmToken);
          }
        });
        hls.loadSource(signedUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = signedUrl;
      }
    };
    
    loadVideo();
  }, [videoId, token]);
  
  return <video ref={videoRef} controls style={{ width: '100%' }} />;
}

export default VideoPlayer;
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `413 Payload Too Large`: File size exceeds limit
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- 100 requests per minute for authenticated users
- 10 uploads per hour per user
- Burst allowance for legitimate traffic

---

## Webhook Support (Future Enhancement)

For async notifications about transcoding completion:

```json
POST <your-webhook-url>
{
  "event": "video.transcoding.completed",
  "videoId": "a1b2c3d4-e5f6-7890",
  "status": "completed",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## Best Practices

1. **Token Management**: Store JWT tokens securely (httpOnly cookies or secure storage)
2. **URL Expiry**: Request new signed URLs before expiration
3. **Error Handling**: Implement retry logic for network failures
4. **Progress Tracking**: Poll transcoding status for long videos
5. **Adaptive Streaming**: Use HLS for best quality/bandwidth balance
6. **Preload**: Prefetch signed URLs for smoother playback
7. **Analytics**: Track video views and engagement metrics
8. **Caching**: Cache video metadata but not signed URLs

---

## Testing

### Using Postman

1. Import the collection from `postman/video-api.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:3000
   - `token`: Your JWT token after login
3. Run the requests in order

### Using cURL

See examples throughout this documentation.

---

## Support

For API issues or questions:
- GitHub Issues: <repository-url>/issues
- Email: support@example.com
