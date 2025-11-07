import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Goal } from './entities/goal.entity';
import { ProgressPhoto } from './entities/progress-photo.entity';
import { Metric } from './entities/metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Goal, ProgressPhoto, Metric])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}