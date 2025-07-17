import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { Document } from '../entities/document.entity';
import { IngestionStatus } from '../entities/ingestion-status.entity';
import { PythonBackendModule } from '../python-backend/python-backend.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document, IngestionStatus]), PythonBackendModule],
  providers: [IngestionService],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {} 