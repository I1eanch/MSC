import { UserRole } from '../../database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}
