import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialCoreModule } from '../../../shared/material/material-core.module';
import { MaterialDataModule } from '../../../shared/material/material-data.module';
import { MaterialFeedbackModule } from '../../../shared/material/material-feedback.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DocumentService, Document } from '../../../services/document.service';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialCoreModule,
    MaterialDataModule,
    MaterialFeedbackModule,
  ],
  templateUrl: './document-list.html',
  styleUrl: './document-list.scss'
})
export class DocumentListComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  
  displayedColumns: string[] = ['title', 'content', 'status', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<Document> = new MatTableDataSource<Document>([]);
  loading = signal(false);
  processingDocuments = signal<Set<string>>(new Set());
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadDocuments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDocuments() {
    this.loading.set(true);
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        // Defer snackbar to avoid change detection issues
        setTimeout(() => {
          this.snackBar.open('Failed to load documents', 'Close', { duration: 3000 });
        }, 0);
        this.loading.set(false);
      }
    });
  }

  refreshDocuments() {
    this.loadDocuments();
    setTimeout(() => {
      this.snackBar.open('Documents refreshed', 'Close', { duration: 2000 });
    }, 0);
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

  viewDocument(document: Document) {
    // Navigate to document detail page
    this.router.navigate(['/documents', document.id]);
  }

  triggerIngestion(document: Document) {
    const processingSet = this.processingDocuments();
    processingSet.add(document.id);
    this.processingDocuments.set(processingSet);

    this.documentService.triggerIngestion(document.id).subscribe({
      next: (ingestionStatus) => {
        setTimeout(() => {
          this.snackBar.open(
            `Ingestion triggered for: ${document.title}`, 
            'Close', 
            { duration: 3000 }
          );
        }, 0);
        // Refresh the document list to show updated status
        this.loadDocuments();
        
        // Remove from processing set
        const updatedSet = this.processingDocuments();
        updatedSet.delete(document.id);
        this.processingDocuments.set(updatedSet);
      },
      error: (error) => {
        console.error('Error triggering ingestion:', error);
        setTimeout(() => {
          this.snackBar.open(
            'Failed to trigger ingestion', 
            'Close', 
            { duration: 3000 }
          );
        }, 0);
        
        // Remove from processing set
        const updatedSet = this.processingDocuments();
        updatedSet.delete(document.id);
        this.processingDocuments.set(updatedSet);
      }
    });
  }

  downloadDocument(doc: Document) {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title}.txt`; // Using .txt since backend returns text
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setTimeout(() => {
          this.snackBar.open(
            `Downloading: ${doc.title}`, 
            'Close', 
            { duration: 2000 }
          );
        }, 0);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        setTimeout(() => {
          this.snackBar.open(
            'Failed to download document', 
            'Close', 
            { duration: 3000 }
          );
        }, 0);
      }
    });
  }

  deleteDocument(document: Document) {
    // Show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${document.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.deleteDocument(document.id).subscribe({
          next: () => {
            setTimeout(() => {
              this.snackBar.open(
                `Document deleted: ${document.title}`, 
                'Close', 
                { duration: 3000 }
              );
            }, 0);
            // Refresh the document list
            this.loadDocuments();
          },
          error: (error) => {
            console.error('Error deleting document:', error);
            setTimeout(() => {
              this.snackBar.open(
                'Failed to delete document', 
                'Close', 
                { duration: 3000 }
              );
            }, 0);
          }
        });
      }
    });
  }
} 