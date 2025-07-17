import { 
  Controller, 
  Get, 
  Param, 
  Res,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';

@Controller('internal/documents')
export class InternalDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':id/content')
  async getDocumentContent(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      console.log(`[GET] /internal/documents/${id}/content requested (internal)`);
      
      // For internal use by Python backend - no auth required
      const doc = await this.documentsService.findOneInternal(id);
      
      if (!doc) {
        console.log(`[GET] /internal/documents/${id}/content not found`);
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }
      
      res.status(HttpStatus.OK).json(doc);
      return;
    } catch (err) {
      console.error(`[GET] /internal/documents/${id}/content error:`, err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      return;
    }
  }
} 