import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UsersService } from './users.service';
import { UserRole } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('trainers')
  @ApiOperation({ summary: 'Get all trainers' })
  @ApiResponse({ status: 200, description: 'Trainers retrieved successfully' })
  async findTrainers() {
    return this.usersService.findTrainers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id/assign-trainer/:trainerId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign trainer to user' })
  @ApiResponse({ status: 200, description: 'Trainer assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or trainer not found' })
  async assignTrainer(@Param('id') userId: string, @Param('trainerId') trainerId: string) {
    return this.usersService.assignTrainer(userId, trainerId);
  }

  @Get(':id/trainer')
  @ApiOperation({ summary: 'Get assigned trainer for user' })
  @ApiResponse({ status: 200, description: 'Trainer retrieved successfully' })
  async getAssignedTrainer(@Param('id') userId: string) {
    return this.usersService.getAssignedTrainer(userId);
  }
}