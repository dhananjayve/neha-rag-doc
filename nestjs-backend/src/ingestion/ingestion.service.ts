import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNotEmpty } from 'class-validator';
import { Document, DocumentStatus } from '../entities/document.entity';
import { IngestionStatus, IngestionStatusType } from '../entities/ingestion-status.entity';
import { User, UserRole } from '../entities/user.entity';
import { PythonBackendService } from '../python-backend/python-backend.service';

export class TriggerIngestionDto {
  @IsString()
  @IsNotEmpty()
  documentId: string;
}

export class IngestionStatusResponseDto {
  id: string;
  documentId: string;
  status: IngestionStatusType;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(IngestionStatus)
    private ingestionStatusRepository: Repository<IngestionStatus>,
    private pythonBackendService: PythonBackendService,
  ) {}

  async triggerIngestion(documentId: string, user: User): Promise<IngestionStatusResponseDto> {
    // Check if document exists and user has access
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user owns the document or is admin
    if (document.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only trigger ingestion for your own documents');
    }

    // Check if document is in a valid state for ingestion
    if (document.status === DocumentStatus.INGESTED) {
      throw new BadRequestException('Document is already ingested');
    }

    // Create ingestion status record
    const ingestionStatus = this.ingestionStatusRepository.create({
      documentId,
      status: IngestionStatusType.PENDING,
      startedAt: new Date(),
    });

    const savedIngestionStatus = await this.ingestionStatusRepository.save(ingestionStatus);

    // Update document status to pending
    document.status = DocumentStatus.PENDING;
    await this.documentRepository.save(document);

    // Trigger Python backend ingestion process
    this.triggerPythonBackendIngestion(savedIngestionStatus.id, documentId);

    return {
      id: savedIngestionStatus.id,
      documentId: savedIngestionStatus.documentId,
      status: savedIngestionStatus.status,
      startedAt: savedIngestionStatus.startedAt,
      completedAt: savedIngestionStatus.completedAt,
      errorMessage: savedIngestionStatus.errorMessage,
      createdAt: savedIngestionStatus.createdAt,
    };
  }

  async getIngestionStatus(documentId: string, user: User): Promise<IngestionStatusResponseDto[]> {
    // Check if document exists and user has access
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user owns the document or is admin
    if (document.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only view ingestion status for your own documents');
    }

    const ingestionStatuses = await this.ingestionStatusRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });

    return ingestionStatuses.map(status => ({
      id: status.id,
      documentId: status.documentId,
      status: status.status,
      startedAt: status.startedAt,
      completedAt: status.completedAt,
      errorMessage: status.errorMessage,
      createdAt: status.createdAt,
    }));
  }

  async getAllIngestionStatuses(user: User): Promise<IngestionStatusResponseDto[]> {
    let query = this.ingestionStatusRepository.createQueryBuilder('ingestionStatus')
      .leftJoinAndSelect('ingestionStatus.document', 'document');

    // If user is not admin, only show their own documents' ingestion statuses
    if (user.role !== UserRole.ADMIN) {
      query = query.where('document.ownerId = :ownerId', { ownerId: user.id });
    }

    const ingestionStatuses = await query
      .orderBy('ingestionStatus.createdAt', 'DESC')
      .getMany();

    return ingestionStatuses.map(status => ({
      id: status.id,
      documentId: status.documentId,
      status: status.status,
      startedAt: status.startedAt,
      completedAt: status.completedAt,
      errorMessage: status.errorMessage,
      createdAt: status.createdAt,
    }));
  }

  private async triggerPythonBackendIngestion(ingestionId: string, documentId: string): Promise<void> {
    // Start the ingestion process asynchronously
    this.processIngestionWithPythonBackend(ingestionId, documentId);
  }

  private async processIngestionWithPythonBackend(ingestionId: string, documentId: string): Promise<void> {
    try {
      // Update status to running
      await this.ingestionStatusRepository.update(ingestionId, {
        status: IngestionStatusType.RUNNING,
      });

      // Call Python backend to ingest the document
      const result = await this.pythonBackendService.ingestDocument(documentId);
      
      if (result.status === 'success') {
        // Update status to completed
        await this.ingestionStatusRepository.update(ingestionId, {
          status: IngestionStatusType.COMPLETED,
          completedAt: new Date(),
        });

        // Update document status
        await this.documentRepository.update(documentId, {
          status: DocumentStatus.INGESTED,
        });
      } else {
        throw new Error(result.message || 'Ingestion failed');
      }

    } catch (error) {
      console.error('Python backend ingestion error:', error);
      
      // Update status to failed
      await this.ingestionStatusRepository.update(ingestionId, {
        status: IngestionStatusType.FAILED,
        errorMessage: error.message,
      });

      // Update document status
      await this.documentRepository.update(documentId, {
        status: DocumentStatus.FAILED,
      });
    }
  }
} 