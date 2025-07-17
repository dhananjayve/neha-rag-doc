import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { InternalDocumentsController } from './internal-documents.controller';
import { Document } from '../entities/document.entity';
import { IngestionStatus } from '../entities/ingestion-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, IngestionStatus])],
  providers: [DocumentsService],
  controllers: [DocumentsController, InternalDocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {} 