# Quick Start Guide

Get the Video Infrastructure Service running in 15 minutes.

## Prerequisites

- Node.js 16+ installed
- AWS account with access to S3, MediaConvert, and CloudFront
- Basic knowledge of REST APIs

## 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd video-infrastructure-service

# Install dependencies
npm install
```

## 2. AWS Setup (Simplified)

### Create S3 Buckets
```bash
# Upload bucket
aws s3 mb s3://my-video-uploads

# Output bucket
aws s3 mb s3://my-video-outputs
```

### Get MediaConvert Endpoint
```bash
aws mediaconvert describe-endpoints --region us-east-1
```

Output will contain your endpoint URL, e.g.:
```
https://abcd1234.mediaconvert.us-east-1.amazonaws.com
```

### Create IAM User
1. Go to AWS Console → IAM → Users
2. Create new user "video-service-user"
3. Attach policies:
   - AmazonS3FullAccess (or custom policy)
   - AWSElementalMediaConvertFullAccess
4. Create access key and save credentials

### Create MediaConvert Role
1. Go to AWS Console → IAM → Roles
2. Create role for MediaConvert service
3. Attach policy: AmazonS3FullAccess
4. Note the Role ARN

### Setup CloudFront (Optional for now)
For quick start, you can skip CloudFront and use S3 URLs directly.

## 3. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
nano .env
```

**Minimal .env for testing:**
```env
PORT=3000
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# S3 Configuration
S3_BUCKET_NAME=my-video-uploads
S3_OUTPUT_BUCKET_NAME=my-video-outputs

# MediaConvert Configuration
MEDIACONVERT_ENDPOINT=https://abcd1234.mediaconvert.us-east-1.amazonaws.com
MEDIACONVERT_ROLE_ARN=arn:aws:iam::123456789:role/MediaConvertRole
MEDIACONVERT_QUEUE_ARN=arn:aws:mediaconvert:us-east-1:123456789:queues/Default

# CloudFront (Optional - leave blank for testing)
CLOUDFRONT_DOMAIN=
CLOUDFRONT_KEY_PAIR_ID=
CLOUDFRONT_PRIVATE_KEY_PATH=

# JWT Configuration
JWT_SECRET=my-super-secret-key-change-this-in-production
JWT_EXPIRY=24h

# Security
SIGNED_URL_EXPIRY=3600

# Database
DATABASE_PATH=./data/videos.db
```

## 4. Create Required Directories

```bash
mkdir -p data logs keys
```

## 5. Start the Server

```bash
npm start
```

You should see:
```
info: Connected to SQLite database
info: Database tables initialized
info: Video Infrastructure Service running on port 3000
info: Environment: development
```

## 6. Test the API

### 6.1 Check Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 6.2 Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trainer1",
    "email": "trainer@test.com",
    "password": "test123456"
  }'
```

### 6.3 Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@test.com",
    "password": "test123456"
  }'
```

Save the token from the response!

### 6.4 Upload a Video
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/your/video.mp4" \
  -F "title=My First Video" \
  -F "description=Testing upload"
```

Save the `videoId` from the response!

### 6.5 Check Transcoding Status
```bash
VIDEO_ID="video-id-from-upload"

curl http://localhost:3000/api/videos/$VIDEO_ID/status \
  -H "Authorization: Bearer $TOKEN"
```

### 6.6 List Videos
```bash
curl http://localhost:3000/api/videos \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Using Postman

1. Import the collection: `postman/video-api-collection.json`
2. Create an environment with:
   - `baseUrl`: http://localhost:3000
   - `token`: (will be set automatically after login)
3. Run the requests in order:
   - Health Check
   - Register User
   - Login (saves token)
   - Upload Video (saves videoId)
   - Get Video Details
   - etc.

## 8. Testing Video Playback

Once transcoding completes (check status endpoint):

```bash
curl http://localhost:3000/api/videos/$VIDEO_ID/signed-url?format=hls&resolution=1080p \
  -H "Authorization: Bearer $TOKEN"
```

Use the returned `signedUrl` in a video player.

## Common Issues

### "AWS credentials not configured"
- Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
- Verify IAM user has correct permissions

### "MediaConvert endpoint not found"
- Run: `aws mediaconvert describe-endpoints --region us-east-1`
- Update MEDIACONVERT_ENDPOINT in .env

### "S3 bucket not found"
- Ensure buckets exist: `aws s3 ls`
- Check bucket names in .env match exactly

### "File too large"
- Default limit is 5GB
- For testing, use smaller videos (< 100MB)

### "Transcoding stuck"
- Check MediaConvert console for job status
- Verify MediaConvert role has S3 access
- Check input video format is supported

### "Database locked"
- SQLite doesn't handle concurrent writes well
- For production, use PostgreSQL/MySQL

## Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Setup CloudFront**: For signed URLs and CDN
5. **Production Database**: Migrate from SQLite
6. **Add Monitoring**: CloudWatch, logs analysis
7. **Scale**: Add load balancer, multiple instances

## Testing Workflow

Complete workflow test:

```bash
# 1. Start server
npm start

# 2. Register and login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@test.com","password":"test123456"}' \
  | jq -r '.token')

# 3. Upload video
VIDEO_ID=$(curl -s -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video" \
  | jq -r '.videoId')

echo "Video ID: $VIDEO_ID"

# 4. Check status (repeat until completed)
curl http://localhost:3000/api/videos/$VIDEO_ID/status \
  -H "Authorization: Bearer $TOKEN"

# 5. Get signed URL
curl http://localhost:3000/api/videos/$VIDEO_ID/signed-url \
  -H "Authorization: Bearer $TOKEN"
```

## Video Player Example

Save as `player.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Video Player Test</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
  <h1>Video Player Test</h1>
  <input type="text" id="videoId" placeholder="Enter Video ID" style="width: 300px">
  <button onclick="loadVideo()">Load Video</button>
  <br><br>
  <video id="video" controls width="100%" style="max-width: 1280px"></video>
  
  <script>
    const API_BASE = 'http://localhost:3000/api';
    const TOKEN = 'your-jwt-token-here'; // Replace with your token
    
    async function loadVideo() {
      const videoId = document.getElementById('videoId').value;
      
      try {
        const response = await fetch(
          `${API_BASE}/videos/${videoId}/signed-url?format=hls&resolution=1080p`,
          {
            headers: {
              'Authorization': `Bearer ${TOKEN}`
            }
          }
        );
        
        const data = await response.json();
        const video = document.getElementById('video');
        
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(data.signedUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = data.signedUrl;
        }
      } catch (error) {
        alert('Error loading video: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

## Support

- GitHub Issues: <repo-url>/issues
- Documentation: See README.md
- API Docs: See API_DOCUMENTATION.md

Happy coding! 🎥
