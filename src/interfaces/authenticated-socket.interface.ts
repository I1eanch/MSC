import { Socket } from 'socket.io';
import { User } from '../entities/user.entity';

export interface AuthenticatedSocket extends Socket {
  user: User;
}