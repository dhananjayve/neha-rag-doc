import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
  NotFoundException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from '../dto/document.dto';
import { Response } from 'express';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @Request() req,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.create(createDocumentDto, req.user);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadDocument(
    @Body() body: { title: string; description: string },
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ): Promise<DocumentResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Process uploaded files and save as BLOBs
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await this.extractFileContent(file);
        return {
          title: `${body.title} - ${file.originalname}`,
          content: content,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileContent: file.buffer, // Store file as BLOB
          fileSize: file.size,
        };
      })
    );

    // Create documents for each uploaded file
    const createdDocuments = await Promise.all(
      fileContents.map(async (fileData) => {
        return this.documentsService.create(fileData, req.user);
      })
    );

    // Return the first document (or you could return all of them)
    return createdDocuments[0];
  }

  @Get()
  async findAll(@Request() req): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req, @Res() res: Response): Promise<void> {
    try {
      console.log(`[GET] /documents/${id} requested by user`, req.user?.id);
      console.log(`[GET] /documents/${id} user details:`, { userId: req.user?.id, role: req.user?.role });
      
      const doc = await this.documentsService.findOne(id, req.user);
      console.log(`[GET] /documents/${id} found document:`, doc ? 'YES' : 'NO');
      
      if (!doc) {
        console.log(`[GET] /documents/${id} not found`);
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }
      
      console.log(`[GET] /documents/${id} returning document with fields:`, {
        id: doc.id,
        title: doc.title,
        hasContent: !!doc.content,
        hasOriginalName: !!doc.originalName,
        hasMimeType: !!doc.mimeType,
        fileSize: doc.fileSize
      });
      
      res.status(HttpStatus.OK).json(doc);
      return;
    } catch (err) {
      console.error(`[GET] /documents/${id} error:`, err);
      if (err instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      return;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.update(id, updateDocumentDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req, @Res() res: Response): Promise<void> {
    try {
      console.log(`[DELETE] /documents/${id} requested by user`, req.user?.id);
      await this.documentsService.remove(id, req.user);
      res.status(HttpStatus.NO_CONTENT).send();
      return;
    } catch (err) {
      console.error(`[DELETE] /documents/${id} error:`, err);
      if (err instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      return;
    }
  }

  private async extractFileContent(file: Express.Multer.File): Promise<string> {
    // For text files, extract directly
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8');
    }
    
    // For other file types, call the Python backend for text extraction
    try {
      // Use node-fetch compatible FormData
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      
      const response = await fetch('http://python-backend:8000/extract-text', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.extracted_text;
      } else {
        console.error('Text extraction failed:', await response.text());
        return `Content extracted from ${file.originalname} (${file.mimetype}) - Extraction failed`;
      }
    } catch (error) {
      console.error('Error calling Python backend for text extraction:', error);
      return `Content extracted from ${file.originalname} (${file.mimetype}) - Extraction error`;
    }
  }

  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string, 
    @Request() req, 
    @Res() res: Response
  ): Promise<void> {
    try {
      console.log(`[GET] /documents/${id}/download requested by user`, req.user?.id);
      const document = await this.documentsService.findOne(id, req.user);
      if (!document) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }

      // Get the full document with file content from database
      const fullDocument = await this.documentsService.findOneInternal(id);
      if (!fullDocument) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
        return;
      }

      // Use original filename if available, otherwise create one with proper extension
      let filename = document.originalName;
      if (!filename) {
        // Extract extension from mime type or use .txt as fallback
        const extension = this.getExtensionFromMimeType(document.mimeType);
        filename = `${document.title}${extension}`;
      }
      
      res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', document.fileSize?.toString() || '0');
      
      // Send the file content from BLOB
      if (fullDocument.fileContent) {
        res.send(Buffer.from(fullDocument.fileContent));
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'File content not found' });
      }
    } catch (err) {
      console.error(`[GET] /documents/${id}/download error:`, err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  private getExtensionFromMimeType(mimeType: string | undefined): string {
    if (!mimeType) return '.txt';
    
    const mimeToExt: { [key: string]: string } = {
      'text/plain': '.txt',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'text/html': '.html',
      'text/xml': '.xml',
      'application/json': '.json',
    };
    
    return mimeToExt[mimeType] || '.txt';
  }
} 