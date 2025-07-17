import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../entities/document.entity';
import { User, UserRole } from '../entities/user.entity';
import { IngestionStatus } from '../entities/ingestion-status.entity';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from '../dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(IngestionStatus)
    private ingestionStatusRepository: Repository<IngestionStatus>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, user: User): Promise<DocumentResponseDto> {
    const document = this.documentRepository.create({
      ...createDocumentDto,
      ownerId: user.id,
      status: DocumentStatus.PENDING,
    });

    const savedDocument = await this.documentRepository.save(document);

    return {
      id: savedDocument.id,
      title: savedDocument.title,
      content: savedDocument.content,
      status: savedDocument.status,
      ownerId: savedDocument.ownerId,
      createdAt: savedDocument.createdAt,
      filePath: savedDocument.filePath,
      originalName: savedDocument.originalName,
      mimeType: savedDocument.mimeType,
      fileSize: savedDocument.fileSize,
    };
  }

  async findAll(user: User): Promise<DocumentResponseDto[]> {
    let query = this.documentRepository.createQueryBuilder('document');

    // If user is not admin, only show their own documents
    if (user.role !== UserRole.ADMIN) {
      query = query.where('document.ownerId = :ownerId', { ownerId: user.id });
    }

    const documents = await query.getMany();

    return documents.map(document => ({
      id: document.id,
      title: document.title,
      content: document.content,
      status: document.status,
      ownerId: document.ownerId,
      createdAt: document.createdAt,
      filePath: document.filePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
    }));
  }

  async findOne(id: string, user: User): Promise<DocumentResponseDto> {
    let query = this.documentRepository.createQueryBuilder('document')
      .where('document.id = :id', { id });

    // If user is not admin, only allow access to their own documents
    if (user.role !== UserRole.ADMIN) {
      query = query.andWhere('document.ownerId = :ownerId', { ownerId: user.id });
    }

    const document = await query.getOne();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      status: document.status,
      ownerId: document.ownerId,
      createdAt: document.createdAt,
      filePath: document.filePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
    };
  }

  async findOneInternal(id: string): Promise<DocumentResponseDto | null> {
    const document = await this.documentRepository.findOne({
      where: { id }
    });

    if (!document) {
      return null;
    }

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      status: document.status,
      ownerId: document.ownerId,
      createdAt: document.createdAt,
      filePath: document.filePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      fileContent: document.fileContent, // Include the file content for Python backend
    };
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, user: User): Promise<DocumentResponseDto> {
    let query = this.documentRepository.createQueryBuilder('document')
      .where('document.id = :id', { id });

    // If user is not admin, only allow updates to their own documents
    if (user.role !== UserRole.ADMIN) {
      query = query.andWhere('document.ownerId = :ownerId', { ownerId: user.id });
    }

    const document = await query.getOne();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Update document fields
    if (updateDocumentDto.title !== undefined) {
      document.title = updateDocumentDto.title;
    }
    if (updateDocumentDto.content !== undefined) {
      document.content = updateDocumentDto.content;
    }
    if (updateDocumentDto.status !== undefined) {
      document.status = updateDocumentDto.status;
    }

    const updatedDocument = await this.documentRepository.save(document);

    return {
      id: updatedDocument.id,
      title: updatedDocument.title,
      content: updatedDocument.content,
      status: updatedDocument.status,
      ownerId: updatedDocument.ownerId,
      createdAt: updatedDocument.createdAt,
      filePath: updatedDocument.filePath,
      originalName: updatedDocument.originalName,
      mimeType: updatedDocument.mimeType,
      fileSize: updatedDocument.fileSize,
    };
  }

  async remove(id: string, user: User): Promise<void> {
    let query = this.documentRepository.createQueryBuilder('document')
      .where('document.id = :id', { id });

    // If user is not admin, only allow deletion of their own documents
    if (user.role !== UserRole.ADMIN) {
      query = query.andWhere('document.ownerId = :ownerId', { ownerId: user.id });
    }

    const document = await query.getOne();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete related ingestion status records first
    await this.ingestionStatusRepository.delete({ documentId: id });

    // Delete the document
    await this.documentRepository.remove(document);
  }
} 