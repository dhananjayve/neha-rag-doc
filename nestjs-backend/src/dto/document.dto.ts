import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { DocumentStatus } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  fileContent?: Buffer;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

export class DocumentResponseDto {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  ownerId?: string;
  createdAt: Date;
  filePath?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  fileContent?: Buffer; // Add file content for Python backend
} 