import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QAService } from './qa.service';
import { AskQuestionDto, QAResponseDto } from '../dto/qa.dto';
import { User } from '../entities/user.entity';

@Controller('qa')
@UseGuards(JwtAuthGuard)
export class QAController {
  constructor(private qaService: QAService) {}

  @Post('ask')
  async askQuestion(
    @Body() dto: AskQuestionDto,
    @Request() req: { user: User }
  ): Promise<QAResponseDto> {
    return this.qaService.askQuestion(dto, req.user);
  }
} 