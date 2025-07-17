import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds?: string[];
}

export class QAResponseDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsArray()
  @IsString({ each: true })
  relevant_documents: string[];

  @IsOptional()
  confidence?: number;
} 