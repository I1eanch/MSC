import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { HabitHistoryQueryDto } from './dto/habit-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('habits')
@ApiBearerAuth()
@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({ status: 201, description: 'Habit created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(req.user.userId, createHabitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user habits' })
  @ApiResponse({ status: 200, description: 'List of habits retrieved' })
  findAll(@Request() req) {
    return this.habitsService.findAll(req.user.userId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all habit templates' })
  @ApiResponse({ status: 200, description: 'List of templates retrieved' })
  getAllTemplates() {
    return this.habitsService.getAllTemplates();
  }

  @Post('templates/:id/create')
  @ApiOperation({ summary: 'Create habit from template' })
  @ApiResponse({ status: 201, description: 'Habit created from template' })
  createFromTemplate(@Request() req, @Param('id') id: string) {
    return this.habitsService.createFromTemplate(req.user.userId, id);
  }

  @Get('templates/by-goals')
  @ApiOperation({ summary: 'Get templates filtered by goals' })
  @ApiResponse({ status: 200, description: 'Filtered templates retrieved' })
  getTemplatesByGoals(@Query('goals') goals: string) {
    const goalsArray = goals ? goals.split(',') : [];
    return this.habitsService.getTemplatesByGoals(goalsArray);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific habit' })
  @ApiResponse({ status: 200, description: 'Habit details retrieved' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.habitsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({ status: 200, description: 'Habit updated successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  update(@Request() req, @Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    return this.habitsService.update(id, req.user.userId, updateHabitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a habit' })
  @ApiResponse({ status: 204, description: 'Habit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.habitsService.remove(id, req.user.userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark habit as complete for a date' })
  @ApiResponse({ status: 201, description: 'Habit marked as complete' })
  @ApiResponse({ status: 400, description: 'Already completed for this date' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  markComplete(@Request() req, @Param('id') id: string, @Body() completeHabitDto: CompleteHabitDto) {
    return this.habitsService.markComplete(id, req.user.userId, completeHabitDto);
  }

  @Delete(':id/complete/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove completion for a specific date' })
  @ApiResponse({ status: 204, description: 'Completion removed' })
  @ApiResponse({ status: 404, description: 'Completion not found' })
  uncompleteHabit(@Request() req, @Param('id') id: string, @Param('date') date: string) {
    return this.habitsService.uncompleteHabit(id, req.user.userId, date);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get habit completion history' })
  @ApiResponse({ status: 200, description: 'Habit history retrieved' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  getHistory(@Request() req, @Param('id') id: string, @Query() query: HabitHistoryQueryDto) {
    return this.habitsService.getHistory(id, req.user.userId, query.startDate, query.endDate);
  }
}
