import {Injectable, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'progress-photos';
  }

  async generateUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; s3Key: string }> {
    const fileId = uuidv4();
    const extension = filename.split('.').pop();
    const s3Key = `users/${userId}/progress-photos/${fileId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { uploadUrl, s3Key };
  }

  async generateDownloadUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Deleted file from S3: ${s3Key}`);
  }

  getBucketName(): string {
    return this.bucketName;
  }
}