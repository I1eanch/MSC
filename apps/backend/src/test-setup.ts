import 'dotenv/config';

// Mock S3Service for testing
jest.mock('./user/s3.service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    generateUploadUrl: jest.fn().mockResolvedValue({
      uploadUrl: 'https://mock-upload-url',
      s3Key: 'mock-s3-key',
    }),
    generateDownloadUrl: jest.fn().mockResolvedValue('https://mock-download-url'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    getBucketName: jest.fn().mockReturnValue('test-bucket'),
  })),
}));