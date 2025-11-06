# Video Infrastructure Service

A comprehensive video handling infrastructure with S3 ingest pipeline, AWS MediaConvert encoding, signed URL access, DRM-lite protection, and CloudFront CDN distribution.

## Features

- **Video Upload**: Direct upload to S3 with automatic transcoding
- **Multi-format Encoding**: HLS (adaptive bitrate) and MP4 outputs via AWS MediaConvert
- **Multiple Resolutions**: 1080p, 720p, and 480p automatically generated
- **Signed URLs**: Secure, time-limited access to video content
- **DRM-lite Protection**: Token-based playback authorization
- **CDN Distribution**: CloudFront integration for global content delivery
- **Metadata Management**: SQLite database for video tracking
- **RESTful API**: Complete API for upload lifecycle management
- **Authentication**: JWT-based user authentication and authorization
- **Role-based Access**: Trainer and admin roles with different permissions

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  API Server  │────▶│     S3      │
│  (Trainer)  │     │   (Express)  │     │   Upload    │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            │                     ▼
                            │             ┌─────────────┐
                            │             │MediaConvert │
                            │             │  Encoding   │
                            │             └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Database   │     │     S3      │
                    │   (SQLite)   │     │   Output    │
                    └──────────────┘     └─────────────┘
                                                 │
                                                 ▼
                                         ┌─────────────┐
                                         │ CloudFront  │
                                         │     CDN     │
                                         └─────────────┘
```

## Prerequisites

- Node.js 16.x or higher
- AWS Account with:
  - S3 buckets (input and output)
  - AWS MediaConvert access
  - CloudFront distribution
  - IAM role for MediaConvert
  - CloudFront key pair for signed URLs
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd video-infrastructure-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your AWS credentials and configuration:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-upload-bucket
S3_OUTPUT_BUCKET_NAME=your-output-bucket
MEDIACONVERT_ENDPOINT=https://your-endpoint.amazonaws.com
MEDIACONVERT_ROLE_ARN=arn:aws:iam::account:role/MediaConvertRole
CLOUDFRONT_DOMAIN=your-distribution.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=your-key-pair-id
CLOUDFRONT_PRIVATE_KEY_PATH=./keys/cloudfront-private-key.pem
JWT_SECRET=your-secure-secret
```

5. Create required directories:
```bash
mkdir -p keys data logs
```

6. Add your CloudFront private key to `keys/cloudfront-private-key.pem`

## AWS Setup

### S3 Buckets

Create two S3 buckets:
- **Upload bucket**: For original video uploads
- **Output bucket**: For transcoded videos

Configure CORS on the upload bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### MediaConvert

1. Create an IAM role for MediaConvert with permissions to access your S3 buckets
2. Note your MediaConvert endpoint (found in AWS Console → MediaConvert → Account)
3. Create a queue (or use the default queue)

### CloudFront

1. Create a CloudFront distribution pointing to your output S3 bucket
2. Enable signed URLs by creating a CloudFront key pair
3. Download the private key and save to `keys/cloudfront-private-key.pem`
4. Configure origin access identity for secure S3 access

## Usage

### Starting the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 (or the port specified in `.env`).

### API Endpoints

#### Authentication

**Register a new user:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "trainer1",
  "email": "trainer@example.com",
  "password": "securePassword123",
  "role": "trainer"
}
```

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "trainer@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "trainer1",
    "email": "trainer@example.com",
    "role": "trainer"
  }
}
```

#### Video Management

**Upload a video:**
```bash
POST /api/videos/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Form fields:
- video: <video-file>
- title: "My Training Video"
- description: "Advanced training session"

Response:
{
  "message": "Video uploaded successfully",
  "videoId": "uuid",
  "status": "transcoding",
  "jobId": "mediaconvert-job-id"
}
```

**List videos:**
```bash
GET /api/videos?status=completed&limit=10&offset=0
Authorization: Bearer <jwt-token>

Response:
{
  "videos": [
    {
      "id": "uuid",
      "title": "My Training Video",
      "description": "Advanced training session",
      "status": "completed",
      "duration": 320.5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "limit": 10,
  "offset": 0
}
```

**Get video details:**
```bash
GET /api/videos/:id
Authorization: Bearer <jwt-token>

Response:
{
  "video": {
    "id": "uuid",
    "title": "My Training Video",
    "status": "completed",
    ...
  },
  "outputs": [
    {
      "format": "hls",
      "resolution": "1080p",
      "cloudfront_url": "https://cdn.example.com/..."
    }
  ]
}
```

**Get signed streaming URL:**
```bash
GET /api/videos/:id/signed-url?format=hls&resolution=1080p
Authorization: Bearer <jwt-token>

Response:
{
  "signedUrl": "https://cdn.example.com/...?Policy=...&Signature=...&Key-Pair-Id=...",
  "drmToken": "jwt-drm-token",
  "expiresIn": 3600,
  "format": "hls",
  "resolution": "1080p"
}
```

**Check transcoding status:**
```bash
GET /api/videos/:id/status
Authorization: Bearer <jwt-token>

Response:
{
  "videoId": "uuid",
  "status": "transcoding",
  "progress": 45,
  "jobId": "mediaconvert-job-id"
}
```

**Delete a video:**
```bash
DELETE /api/videos/:id
Authorization: Bearer <jwt-token>

Response:
{
  "message": "Video deleted successfully"
}
```

### Video Player Integration

Example HTML5 player with HLS.js:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Video Player</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
  <video id="video" controls width="100%"></video>
  
  <script>
    const video = document.getElementById('video');
    const signedUrl = 'YOUR_SIGNED_URL_HERE';
    const drmToken = 'YOUR_DRM_TOKEN_HERE';
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: function(xhr, url) {
          xhr.setRequestHeader('X-DRM-Token', drmToken);
        }
      });
      hls.loadSource(signedUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = signedUrl;
    }
  </script>
</body>
</html>
```

## Security Features

### Signed URLs
- Time-limited access to video content
- CloudFront signed URLs with configurable expiry
- Prevents unauthorized access and hotlinking

### DRM-lite Protection
- JWT-based tokens for playback authorization
- Device fingerprinting
- Playback policy enforcement
- IP restrictions (optional)
- Geographic restrictions (optional)
- Maximum playback count limits (optional)

### Authentication
- JWT-based user authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token expiration and refresh

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password`: Hashed password
- `role`: User role (trainer/admin)
- `created_at`: Registration timestamp

### Videos Table
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `title`: Video title
- `description`: Video description
- `original_filename`: Original file name
- `s3_key`: S3 object key
- `s3_bucket`: S3 bucket name
- `file_size`: File size in bytes
- `duration`: Video duration in seconds
- `status`: Processing status (uploaded/transcoding/completed/failed)
- `mediaconvert_job_id`: MediaConvert job ID
- `thumbnail_url`: Thumbnail image URL
- `created_at`: Upload timestamp
- `updated_at`: Last update timestamp

### Video Outputs Table
- `id`: Primary key
- `video_id`: Foreign key to videos
- `format`: Output format (hls/mp4)
- `resolution`: Video resolution (1080p/720p/480p)
- `s3_key`: S3 object key
- `s3_bucket`: S3 bucket name
- `cloudfront_url`: CDN URL
- `file_size`: File size in bytes
- `bitrate`: Video bitrate
- `created_at`: Creation timestamp

## Video Processing Pipeline

1. **Upload**: Video uploaded to S3 via multer-s3
2. **Metadata**: Video metadata saved to database
3. **Transcoding**: MediaConvert job initiated automatically
4. **Processing**: Multiple resolutions and formats generated
   - HLS: 1080p, 720p, 480p (adaptive bitrate streaming)
   - MP4: 1080p (download/offline viewing)
   - Thumbnail: Frame capture at 720p
5. **Storage**: Outputs saved to separate S3 bucket
6. **Distribution**: CloudFront CDN for global delivery
7. **Access**: Signed URLs generated on-demand

## Error Handling

The service includes comprehensive error handling:
- Input validation with express-validator
- AWS service error handling
- Database error handling
- Graceful degradation for missing CloudFront keys
- Structured logging with Winston

## Logging

Logs are written to:
- `logs/error.log`: Error-level logs
- `logs/combined.log`: All logs
- Console: Development environment only

## Development

Run tests:
```bash
npm test
```

Check health endpoint:
```bash
curl http://localhost:3000/health
```

## Production Considerations

1. **Environment Variables**: Never commit `.env` to version control
2. **Database**: Consider migrating to PostgreSQL or MySQL for production
3. **CloudFront Keys**: Secure storage of private keys (AWS Secrets Manager)
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Add CloudWatch or similar monitoring
6. **Scaling**: Use queue system (SQS) for large-scale transcoding
7. **Backup**: Regular database and S3 backups
8. **HTTPS**: Always use HTTPS in production
9. **CORS**: Configure appropriate CORS policies
10. **CDN**: Optimize CloudFront cache policies

## Troubleshooting

### Video upload fails
- Check S3 bucket permissions
- Verify AWS credentials
- Check file size limits
- Review CloudWatch logs

### Transcoding stuck
- Check MediaConvert queue status
- Verify IAM role permissions
- Check input file format compatibility

### Signed URLs not working
- Verify CloudFront key pair configuration
- Check private key file path
- Ensure CloudFront distribution is deployed
- Verify origin access identity

### Authentication issues
- Check JWT_SECRET is set
- Verify token hasn't expired
- Check user credentials

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.
