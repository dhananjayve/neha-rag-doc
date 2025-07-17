import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

export interface PythonBackendConfig {
  baseUrl: string;
  timeout: number;
}

export interface DocumentIngestRequest {
  document_id: string;
}

export interface DocumentIngestResponse {
  status: string;
  message: string;
  embeddings_count?: number;
}

export interface QAResponse {
  question: string;
  answer: string;
  relevant_documents: string[];
  confidence: number;
}

export interface DocumentSelectionRequest {
  document_ids: string[];
}

@Injectable()
export class PythonBackendService {
  private readonly config: PythonBackendConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
      timeout: 120000, // 2 minutes
    };
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response: AxiosResponse<T> = await axios({
        method,
        url,
        data,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data?.detail || 'Python backend error',
          error.response.status
        );
      } else if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Python backend is not available',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        throw new HttpException(
          'Failed to communicate with Python backend',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.makeRequest<{ status: string; service: string }>('GET', '/health');
  }

  async ingestDocument(documentId: string): Promise<DocumentIngestResponse> {
    const request: DocumentIngestRequest = { document_id: documentId };
    return this.makeRequest<DocumentIngestResponse>('POST', '/ingest', request);
  }

  async askQuestion(
    question: string,
    documentIds?: string[]
  ): Promise<QAResponse> {
    const requestData = {
      question: question,
      document_ids: documentIds || []
    };

    return this.makeRequest<QAResponse>('POST', '/qa', requestData);
  }

  async selectDocuments(documentIds: string[]): Promise<{ status: string; message: string }> {
    const request: DocumentSelectionRequest = { document_ids: documentIds };
    return this.makeRequest<{ status: string; message: string }>('POST', '/documents/select', request);
  }

  async listDocuments(): Promise<{ documents: Array<{ id: string; title: string; status: string; created_at: string }> }> {
    return this.makeRequest<{ documents: Array<{ id: string; title: string; status: string; created_at: string }> }>('GET', '/documents');
  }
} 