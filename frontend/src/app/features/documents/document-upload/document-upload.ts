import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.scss'
})
export class DocumentUploadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private documentService = inject(DocumentService);
  
  uploadForm: FormGroup;
  selectedFiles: File[] = [];
  isDragOver = false;
  uploading = false;
  uploadProgress = 0;

  constructor() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit() {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  addFiles(files: File[]) {
    const validFiles = files.filter(file => this.isValidFile(file));
    
    if (validFiles.length !== files.length) {
      setTimeout(() => {
        this.snackBar.open('Some files were skipped due to invalid format', 'Close', { duration: 3000 });
      }, 0);
    }
    
    this.selectedFiles.push(...validFiles);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  isValidFile(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return validTypes.includes(file.type);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit() {
    if (this.uploadForm.valid && this.selectedFiles.length > 0) {
      this.uploading = true;
      this.uploadProgress = 0;
      
      const uploadData = {
        title: this.uploadForm.value.title,
        description: this.uploadForm.value.description,
        files: this.selectedFiles
      };

      this.documentService.uploadDocument(uploadData).subscribe({
        next: (document) => {
          this.uploading = false;
          this.uploadProgress = 100;
          setTimeout(() => {
            this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
          }, 0);
          this.router.navigate(['/documents']);
        },
        error: (error) => {
          this.uploading = false;
          setTimeout(() => {
            this.snackBar.open(`Upload failed: ${error.message}`, 'Close', { duration: 5000 });
          }, 0);
        }
      });
    }
  }
} 