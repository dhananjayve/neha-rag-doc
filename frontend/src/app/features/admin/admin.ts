import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  totalStorage: number;
  activeSessions: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  // Use signals for reactive state
  stats = signal<SystemStats>({
    totalUsers: 25,
    totalDocuments: 150,
    totalStorage: 2048576000, // 2GB
    activeSessions: 8
  });
  
  usersDataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  userDisplayedColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-01-05'),
        lastLogin: new Date('2024-01-14')
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        status: 'inactive',
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2024-01-12')
      }
    ];
    
    this.usersDataSource.data = mockUsers;
  }

  refreshUsers() {
    this.loadUsers();
    this.snackBar.open('Users refreshed', 'Close', { duration: 2000 });
  }

  formatStorage(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 