import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { User } from './entities/user.entity';
import { Goal, GoalStatus, GoalType } from './entities/goal.entity';
import { ProgressPhoto, PhotoScanStatus } from './entities/progress-photo.entity';
import { Metric, MetricType } from './entities/metric.entity';
import { S3Service } from './s3.service';
import { CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto } from './dto/goal.dto';
import { CreateMetricDto, UpdateMetricDto, GetMetricsQueryDto } from './dto/metric.dto';
import { UploadPhotoDto } from './dto/progress-photo.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(ProgressPhoto)
    private photoRepository: Repository<ProgressPhoto>,
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
    private s3Service: S3Service,
  ) {}

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['goals', 'progressPhotos', 'metrics'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return await this.getUserById(userId);
  }

  // Goal operations
  async createGoal(userId: string, goalData: CreateGoalDto): Promise<Goal> {
    const user = await this.getUserById(userId);
    
    const goal = this.goalRepository.create({
      ...goalData,
      userId,
      startDate: goalData.startDate ? new Date(goalData.startDate) : new Date(),
      targetDate: new Date(goalData.targetDate),
      progress: {
        percentageComplete: 0,
      },
    });

    return await this.goalRepository.save(goal);
  }

  async getGoals(userId: string, status?: GoalStatus): Promise<Goal[]> {
    const whereCondition: any = { userId };
    if (status) {
      whereCondition.status = status;
    }

    return await this.goalRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async getGoalById(userId: string, goalId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    return goal;
  }

  async updateGoal(userId: string, goalId: string, updateData: UpdateGoalDto): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    // Update goal status and completion date if completed
    if (updateData.status === GoalStatus.COMPLETED && goal.status !== GoalStatus.COMPLETED) {
      updateData.completedDate = new Date();
    }

    await this.goalRepository.update(goalId, updateData);
    return await this.getGoalById(userId, goalId);
  }

  async updateGoalProgress(userId: string, goalId: string, progressData: UpdateGoalProgressDto): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    const updatedProgress = {
      ...goal.progress,
      ...progressData,
    };

    // Auto-calculate percentage complete if not provided
    if (progressData.currentWeight && goal.targetValue?.weight) {
      const startWeight = goal.progress?.currentWeight || progressData.currentWeight;
      const targetWeight = goal.targetValue.weight;
      const currentWeight = progressData.currentWeight;
      
      if (goal.type === GoalType.WEIGHT_LOSS) {
        updatedProgress.percentageComplete = Math.max(0, Math.min(100, 
          ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100
        ));
      } else if (goal.type === GoalType.WEIGHT_GAIN) {
        updatedProgress.percentageComplete = Math.max(0, Math.min(100, 
          ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100
        ));
      }
    }

    await this.goalRepository.update(goalId, { progress: updatedProgress });
    return await this.getGoalById(userId, goalId);
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = await this.getGoalById(userId, goalId);
    await this.goalRepository.delete(goalId);
  }

  // Progress photo operations
  async generatePhotoUploadUrl(userId: string, uploadData: UploadPhotoDto): Promise<{ uploadUrl: string; s3Key: string }> {
    await this.getUserById(userId); // Verify user exists
    
    // Simulate content type detection (in real implementation, you'd parse this from the file)
    const extension = uploadData.filename.split('.').pop()?.toLowerCase();
    const contentType = this.getContentTypeFromExtension(extension);

    return await this.s3Service.generateUploadUrl(userId, uploadData.filename, contentType);
  }

  async createPhotoRecord(
    userId: string,
    filename: string,
    originalName: string,
    s3Key: string,
    fileSize: number,
    mimeType: string,
    notes?: string,
  ): Promise<ProgressPhoto> {
    const photo = this.photoRepository.create({
      filename,
      originalName,
      s3Key,
      s3Bucket: this.s3Service.getBucketName(),
      fileSize,
      mimeType,
      notes,
      userId,
    });

    const savedPhoto = await this.photoRepository.save(photo);
    
    // Trigger async scanning process (in real implementation)
    this.schedulePhotoScan(savedPhoto.id);
    
    return savedPhoto;
  }

  async getProgressPhotos(userId: string, limit = 50, offset = 0): Promise<ProgressPhoto[]> {
    return await this.photoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getPhotoById(userId: string, photoId: string): Promise<ProgressPhoto> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found`);
    }

    return photo;
  }

  async getPhotoDownloadUrl(userId: string, photoId: string): Promise<string> {
    const photo = await this.getPhotoById(userId, photoId);
    
    if (photo.scanStatus === PhotoScanStatus.REJECTED) {
      throw new BadRequestException('Photo is not available for download due to security scan results');
    }

    return await this.s3Service.generateDownloadUrl(photo.s3Key);
  }

  async deletePhoto(userId: string, photoId: string): Promise<void> {
    const photo = await this.getPhotoById(userId, photoId);
    
    await this.s3Service.deleteFile(photo.s3Key);
    await this.photoRepository.delete(photoId);
  }

  // Metrics operations
  async createMetric(userId: string, metricData: CreateMetricDto): Promise<Metric> {
    await this.getUserById(userId); // Verify user exists
    
    const metric = this.metricRepository.create({
      ...metricData,
      userId,
      recordedDate: new Date(metricData.recordedDate),
    });

    return await this.metricRepository.save(metric);
  }

  async getMetrics(userId: string, query: GetMetricsQueryDto): Promise<{ metrics: Metric[]; total: number }> {
    const whereCondition: any = { userId };
    
    if (query.type) {
      whereCondition.type = query.type;
    }
    
    if (query.startDate || query.endDate) {
      whereCondition.recordedDate = {};
      if (query.startDate) {
        whereCondition.recordedDate = MoreThanOrEqual(new Date(query.startDate));
      }
      if (query.endDate) {
        whereCondition.recordedDate = LessThanOrEqual(new Date(query.endDate));
      }
    }

    const [metrics, total] = await this.metricRepository.findAndCount({
      where: whereCondition,
      order: { recordedDate: 'DESC' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    return { metrics, total };
  }

  async getMetricById(userId: string, metricId: string): Promise<Metric> {
    const metric = await this.metricRepository.findOne({
      where: { id: metricId, userId },
    });

    if (!metric) {
      throw new NotFoundException(`Metric with ID ${metricId} not found`);
    }

    return metric;
  }

  async updateMetric(userId: string, metricId: string, updateData: UpdateMetricDto): Promise<Metric> {
    const metric = await this.getMetricById(userId, metricId);
    
    const updatePayload: any = { ...updateData };
    if (updateData.recordedDate) {
      updatePayload.recordedDate = new Date(updateData.recordedDate);
    }

    await this.metricRepository.update(metricId, updatePayload);
    return await this.getMetricById(userId, metricId);
  }

  async deleteMetric(userId: string, metricId: string): Promise<void> {
    const metric = await this.getMetricById(userId, metricId);
    await this.metricRepository.delete(metricId);
  }

  async getProgressSummary(userId: string): Promise<any> {
    const user = await this.getUserById(userId);
    
    const activeGoals = await this.getGoals(userId, GoalStatus.ACTIVE);
    const recentPhotos = await this.getProgressPhotos(userId, 5, 0);
    const recentMetrics = await this.getMetrics(userId, { limit: 10 });

    // Get latest metrics by type
    const latestMetrics = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.type', 'type')
      .addSelect('metric.value', 'value')
      .addSelect('metric.unit', 'unit')
      .addSelect('metric.recordedDate', 'recordedDate')
      .addSelect('ROW_NUMBER() OVER (PARTITION BY metric.type ORDER BY metric.recordedDate DESC)', 'rn')
      .where('metric.userId = :userId', { userId })
      .having('rn = 1')
      .getRawMany();

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        unitSystem: user.unitSystem,
      },
      goals: {
        active: activeGoals.length,
        total: user.goals.length,
        items: activeGoals,
      },
      photos: {
        total: user.progressPhotos.length,
        recent: recentPhotos,
      },
      metrics: {
        total: recentMetrics.total,
        latest: latestMetrics,
        recent: recentMetrics.metrics,
      },
    };
  }

  // Helper methods
  private getContentTypeFromExtension(extension?: string): string {
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };

    return contentTypes[extension || 'jpg'] || 'image/jpeg';
  }

  private schedulePhotoScan(photoId: string): void {
    // In a real implementation, this would trigger an async job to scan the photo
    // For now, we'll simulate the scan process
    setTimeout(async () => {
      try {
        await this.photoRepository.update(photoId, {
          scanStatus: PhotoScanStatus.APPROVED,
          scanResult: 'Photo approved by automated scan',
        });
        this.logger.log(`Photo scan completed for photo ID: ${photoId}`);
      } catch (error) {
        this.logger.error(`Failed to update photo scan status for ID: ${photoId}`, error);
      }
    }, Math.random() * 5000 + 2000); // Random delay between 2-7 seconds
  }
}