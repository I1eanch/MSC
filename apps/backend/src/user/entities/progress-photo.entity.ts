import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PhotoScanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCANNING = 'scanning',
}

@Entity('progress_photos')
export class ProgressPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  s3Key: string;

  @Column()
  s3Bucket: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 10 })
  mimeType: string;

  @Column({ type: 'enum', enum: PhotoScanStatus, default: PhotoScanStatus.PENDING })
  scanStatus: PhotoScanStatus;

  @Column({ type: 'text', nullable: true })
  scanResult?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    width?: number;
    height?: number;
    exif?: Record<string, any>;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.progressPhotos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}