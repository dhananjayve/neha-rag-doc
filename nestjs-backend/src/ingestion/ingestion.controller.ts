import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IngestionService, TriggerIngestionDto, IngestionStatusResponseDto } from './ingestion.service';

@Controller('ingestion')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get('test')
  async test(): Promise<{ message: string }> {
    return { message: 'Ingestion module is working' };
  }

  @Post('trigger')
  async triggerIngestion(
    @Body() triggerIngestionDto: TriggerIngestionDto,
    @Request() req,
  ): Promise<IngestionStatusResponseDto> {
    return this.ingestionService.triggerIngestion(triggerIngestionDto.documentId, req.user);
  }

  @Get('status/:documentId')
  async getIngestionStatus(
    @Param('documentId') documentId: string,
    @Request() req,
  ): Promise<IngestionStatusResponseDto[]> {
    return this.ingestionService.getIngestionStatus(documentId, req.user);
  }

  @Get('status')
  async getAllIngestionStatuses(@Request() req): Promise<IngestionStatusResponseDto[]> {
    return this.ingestionService.getAllIngestionStatuses(req.user);
  }
} 