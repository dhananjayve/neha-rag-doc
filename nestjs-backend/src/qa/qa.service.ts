import { Injectable, BadRequestException } from '@nestjs/common';
import { PythonBackendService } from '../python-backend/python-backend.service';
import { User, UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from '../entities/document.entity';
import { AskQuestionDto, QAResponseDto } from '../dto/qa.dto';

@Injectable()
export class QAService {
  constructor(
    private pythonBackendService: PythonBackendService,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async askQuestion(dto: AskQuestionDto, user: User): Promise<QAResponseDto> {
    // Validate question
    if (!dto.question || dto.question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }

    // If document IDs are provided, validate user has access to them
    if (dto.documentIds && dto.documentIds.length > 0) {
      await this.validateDocumentAccess(dto.documentIds, user);
    }

    // Call Python backend for Q&A
    const result = await this.pythonBackendService.askQuestion(
      dto.question,
      dto.documentIds
    );

    return {
      question: result.question,
      answer: result.answer,
      relevant_documents: result.relevant_documents,
      confidence: result.confidence,
    };
  }

  private async validateDocumentAccess(documentIds: string[], user: User): Promise<void> {
    const documents = await this.documentRepository.find({
      where: { id: In(documentIds) },
    });

    // Check if all documents exist
    if (documents.length !== documentIds.length) {
      throw new BadRequestException('One or more documents not found');
    }

    // Check if user has access to all documents
    for (const document of documents) {
      if (document.ownerId !== user.id && user.role !== UserRole.ADMIN) {
        throw new BadRequestException(
          `You don't have access to document: ${document.title}`
        );
      }
    }
  }
} 