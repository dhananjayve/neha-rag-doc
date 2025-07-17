import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { IngestionStatus } from './ingestion-status.entity';

export enum DocumentStatus {
  PENDING = 'pending',
  INGESTED = 'ingested',
  FAILED = 'failed',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ 
    type: 'enum', 
    enum: DocumentStatus, 
    default: DocumentStatus.PENDING 
  })
  status: DocumentStatus;

  @Column({ name: 'file_path', nullable: true })
  filePath: string;

  @Column({ name: 'original_name', nullable: true })
  originalName: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'file_content', type: 'bytea', nullable: true })
  fileContent: Buffer;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.documents, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => IngestionStatus, ingestionStatus => ingestionStatus.document)
  ingestionStatuses: IngestionStatus[];
} 