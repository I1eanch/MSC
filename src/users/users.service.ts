import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'createdAt'],
    });
  }

  async findTrainers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.TRAINER, isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async assignTrainer(userId: string, trainerId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const trainer = await this.usersRepository.findOne({
      where: { id: trainerId, role: UserRole.TRAINER, isActive: true },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    user.assignedTrainerId = trainerId;
    return this.usersRepository.save(user);
  }

  async getAssignedTrainer(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['assignedTrainer'],
    });

    return user?.assignedTrainerId ? this.usersRepository.findOne({
      where: { id: user.assignedTrainerId, isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'createdAt'],
    }) : null;
  }
}