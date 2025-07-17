import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QAService } from './qa.service';
import { QAController } from './qa.controller';
import { Document } from '../entities/document.entity';
import { PythonBackendModule } from '../python-backend/python-backend.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), PythonBackendModule],
  providers: [QAService],
  controllers: [QAController],
  exports: [QAService],
})
export class QAModule {} 