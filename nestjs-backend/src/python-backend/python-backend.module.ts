import { Module } from '@nestjs/common';
import { PythonBackendService } from './python-backend.service';

@Module({
  providers: [PythonBackendService],
  exports: [PythonBackendService],
})
export class PythonBackendModule {} 