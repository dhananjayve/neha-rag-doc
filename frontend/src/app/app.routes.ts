import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'documents',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/documents/document-list/document-list').then(m => m.DocumentListComponent)
          },
          {
            path: 'upload',
            loadComponent: () => import('./features/documents/document-upload/document-upload').then(m => m.DocumentUploadComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/documents/document-detail/document-detail').then(m => m.DocumentDetailComponent)
          }
        ]
      },
      {
        path: 'qa',
        loadComponent: () => import('./features/qa/qa').then(m => m.QaComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent)
      }
    ]
  }
];
