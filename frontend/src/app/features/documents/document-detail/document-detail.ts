import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './document-detail.html',
  styleUrls: ['./document-detail.scss']
})
export class DocumentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private documentService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);

  document: any = null;
  loading = true;
  documentId: string = '';

  ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDocument();
  }

  loadDocument() {
    console.log('Loading document with ID:', this.documentId);
    console.log('Initial loading state:', this.loading);
    this.loading = true;
    console.log('Loading state set to true');
    this.cdr.detectChanges();
    
    this.documentService.getDocument(this.documentId).subscribe({
      next: (doc) => {
        console.log('Document loaded successfully:', doc);
        console.log('Document type:', typeof doc);
        console.log('Document keys:', Object.keys(doc));
        this.document = doc;
        console.log('Document assigned to component:', this.document);
        this.loading = false;
        console.log('Loading state set to false');
        console.log('Final loading state:', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading document:', err);
        this.snackBar.open('Failed to load document', 'Close', { duration: 3000 });
        this.document = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'ingested':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  downloadDocument() {
    this.documentService.downloadDocument(this.documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.document.title}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setTimeout(() => {
          this.snackBar.open('Download started', 'Close', { duration: 2000 });
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.snackBar.open('Failed to download document', 'Close', { duration: 3000 });
        }, 0);
      }
    });
  }

  triggerIngestion() {
    this.documentService.triggerIngestion(this.documentId).subscribe({
      next: (status) => {
        setTimeout(() => {
          this.snackBar.open('Ingestion triggered', 'Close', { duration: 2000 });
        }, 0);
        this.loadDocument();
      },
      error: (err) => {
        setTimeout(() => {
          this.snackBar.open('Failed to trigger ingestion', 'Close', { duration: 3000 });
        }, 0);
      }
    });
  }

  deleteDocument() {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      this.documentService.deleteDocument(this.documentId).subscribe({
        next: () => {
          setTimeout(() => {
            this.snackBar.open('Document deleted', 'Close', { duration: 2000 });
          }, 0);
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          setTimeout(() => {
            this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
          }, 0);
        }
      });
    }
  }
} 