import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'ingested' | 'failed';
  ownerId?: string;
  createdAt: Date;
  updatedAt?: Date;
  filePath?: string;
  originalName?: string;
  mimeType?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  status?: 'pending' | 'ingested' | 'failed';
}

export interface UploadDocumentRequest {
  title: string;
  description: string;
  files: File[];
}

export interface IngestionStatus {
  id: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Get all documents
  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents`);
  }

  // Get a single document
  getDocument(id: string): Observable<Document> {
    console.log('DocumentService.getDocument called with id:', id);
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}`);
  }

  // Create a new document
  createDocument(document: CreateDocumentRequest): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/documents`, document);
  }

  // Update a document
  updateDocument(id: string, document: UpdateDocumentRequest): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/documents/${id}`, document);
  }

  // Delete a document
  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}`);
  }

  // Upload document with files
  uploadDocument(uploadData: UploadDocumentRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    
    uploadData.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.http.post<Document>(`${this.apiUrl}/documents/upload`, formData);
  }

  // Trigger ingestion for a document
  triggerIngestion(documentId: string): Observable<IngestionStatus> {
    return this.http.post<IngestionStatus>(`${this.apiUrl}/ingestion/trigger`, {
      documentId
    });
  }

  // Get ingestion status for a document
  getIngestionStatus(documentId: string): Observable<IngestionStatus[]> {
    return this.http.get<IngestionStatus[]>(`${this.apiUrl}/ingestion/status/${documentId}`);
  }

  // Get all ingestion statuses
  getAllIngestionStatuses(): Observable<IngestionStatus[]> {
    return this.http.get<IngestionStatus[]>(`${this.apiUrl}/ingestion/status`);
  }

  // Download document
  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${id}/download`, {
      responseType: 'blob'
    });
  }
} 