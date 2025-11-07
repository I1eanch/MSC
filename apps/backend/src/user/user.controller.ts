import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto } from './dto/goal.dto';
import { CreateMetricDto, UpdateMetricDto, GetMetricsQueryDto } from './dto/metric.dto';
import { UploadPhotoDto } from './dto/progress-photo.dto';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // User endpoints
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req: { user: { id: string } }) {
    return await this.userService.getUserById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateData: UpdateUserDto,
  ) {
    return await this.userService.updateUser(req.user.id, updateData);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get user progress summary' })
  @ApiResponse({ status: 200, description: 'Progress summary retrieved successfully' })
  async getProgress(@Request() req: { user: { id: string } }) {
    return await this.userService.getProgressSummary(req.user.id);
  }

  // Goal endpoints
  @Post('goals')
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async createGoal(
    @Request() req: { user: { id: string } },
    @Body() goalData: CreateGoalDto,
  ) {
    return await this.userService.createGoal(req.user.id, goalData);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get user goals' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by goal status' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async getGoals(
    @Request() req: { user: { id: string } },
    @Query('status') status?: string,
  ) {
    return await this.userService.getGoals(req.user.id, status as any);
  }

  @Get('goals/:goalId')
  @ApiOperation({ summary: 'Get a specific goal' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  async getGoal(
    @Request() req: { user: { id: string } },
    @Param('goalId') goalId: string,
  ) {
    return await this.userService.getGoalById(req.user.id, goalId);
  }

  @Put('goals/:goalId')
  @ApiOperation({ summary: 'Update a goal' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  async updateGoal(
    @Request() req: { user: { id: string } },
    @Param('goalId') goalId: string,
    @Body() updateData: UpdateGoalDto,
  ) {
    return await this.userService.updateGoal(req.user.id, goalId, updateData);
  }

  @Put('goals/:goalId/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal progress updated successfully' })
  async updateGoalProgress(
    @Request() req: { user: { id: string } },
    @Param('goalId') goalId: string,
    @Body() progressData: UpdateGoalProgressDto,
  ) {
    return await this.userService.updateGoalProgress(req.user.id, goalId, progressData);
  }

  @Delete('goals/:goalId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 204, description: 'Goal deleted successfully' })
  async deleteGoal(
    @Request() req: { user: { id: string } },
    @Param('goalId') goalId: string,
  ) {
    await this.userService.deleteGoal(req.user.id, goalId);
  }

  // Progress photo endpoints
  @Post('photos/upload-url')
  @ApiOperation({ summary: 'Generate signed URL for photo upload' })
  @ApiResponse({ status: 200, description: 'Upload URL generated successfully' })
  async generatePhotoUploadUrl(
    @Request() req: { user: { id: string } },
    @Body() uploadData: UploadPhotoDto,
  ) {
    return await this.userService.generatePhotoUploadUrl(req.user.id, uploadData);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Create photo record after upload' })
  @ApiResponse({ status: 201, description: 'Photo record created successfully' })
  async createPhotoRecord(
    @Request() req: { user: { id: string } },
    @Body() photoData: {
      filename: string;
      originalName: string;
      s3Key: string;
      fileSize: number;
      mimeType: string;
      notes?: string;
    },
  ) {
    return await this.userService.createPhotoRecord(
      req.user.id,
      photoData.filename,
      photoData.originalName,
      photoData.s3Key,
      photoData.fileSize,
      photoData.mimeType,
      photoData.notes,
    );
  }

  @Get('photos')
  @ApiOperation({ summary: 'Get user progress photos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of photos to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of photos to skip' })
  @ApiResponse({ status: 200, description: 'Photos retrieved successfully' })
  async getProgressPhotos(
    @Request() req: { user: { id: string } },
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.userService.getProgressPhotos(
      req.user.id,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Get('photos/:photoId')
  @ApiOperation({ summary: 'Get a specific photo' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Photo retrieved successfully' })
  async getPhoto(
    @Request() req: { user: { id: string } },
    @Param('photoId') photoId: string,
  ) {
    return await this.userService.getPhotoById(req.user.id, photoId);
  }

  @Get('photos/:photoId/download-url')
  @ApiOperation({ summary: 'Get signed URL for photo download' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  async getPhotoDownloadUrl(
    @Request() req: { user: { id: string } },
    @Param('photoId') photoId: string,
  ) {
    const url = await this.userService.getPhotoDownloadUrl(req.user.id, photoId);
    return { downloadUrl: url };
  }

  @Delete('photos/:photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({ status: 204, description: 'Photo deleted successfully' })
  async deletePhoto(
    @Request() req: { user: { id: string } },
    @Param('photoId') photoId: string,
  ) {
    await this.userService.deletePhoto(req.user.id, photoId);
  }

  // Metrics endpoints
  @Post('metrics')
  @ApiOperation({ summary: 'Create a new metric' })
  @ApiResponse({ status: 201, description: 'Metric created successfully' })
  async createMetric(
    @Request() req: { user: { id: string } },
    @Body() metricData: CreateMetricDto,
  ) {
    return await this.userService.createMetric(req.user.id, metricData);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get user metrics' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by metric type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of metrics to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of metrics to skip' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(
    @Request() req: { user: { id: string } },
    @Query() query: GetMetricsQueryDto,
  ) {
    return await this.userService.getMetrics(req.user.id, query);
  }

  @Get('metrics/:metricId')
  @ApiOperation({ summary: 'Get a specific metric' })
  @ApiParam({ name: 'metricId', description: 'Metric ID' })
  @ApiResponse({ status: 200, description: 'Metric retrieved successfully' })
  async getMetric(
    @Request() req: { user: { id: string } },
    @Param('metricId') metricId: string,
  ) {
    return await this.userService.getMetricById(req.user.id, metricId);
  }

  @Put('metrics/:metricId')
  @ApiOperation({ summary: 'Update a metric' })
  @ApiParam({ name: 'metricId', description: 'Metric ID' })
  @ApiResponse({ status: 200, description: 'Metric updated successfully' })
  async updateMetric(
    @Request() req: { user: { id: string } },
    @Param('metricId') metricId: string,
    @Body() updateData: UpdateMetricDto,
  ) {
    return await this.userService.updateMetric(req.user.id, metricId, updateData);
  }

  @Delete('metrics/:metricId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a metric' })
  @ApiParam({ name: 'metricId', description: 'Metric ID' })
  @ApiResponse({ status: 204, description: 'Metric deleted successfully' })
  async deleteMetric(
    @Request() req: { user: { id: string } },
    @Param('metricId') metricId: string,
  ) {
    await this.userService.deleteMetric(req.user.id, metricId);
  }
}