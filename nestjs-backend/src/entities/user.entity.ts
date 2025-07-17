import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Document } from './document.entity';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  username: string;

  @Column({ unique: true, length: 128 })
  email: string;

  @Column({ name: 'password_hash', length: 256 })
  passwordHash: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.VIEWER 
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Document, document => document.owner)
  documents: Document[];
} 