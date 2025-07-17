import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialCoreModule } from '../../shared/material/material-core.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as AuthSelectors from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MaterialCoreModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private store = inject(Store);
  
  // Convert observables to signals
  isAuthenticated = toSignal(this.store.select(AuthSelectors.selectIsAuthenticated));
  user = toSignal(this.store.select(AuthSelectors.selectUser));

  logout() {
    // TODO: Implement logout action
    console.log('Logout clicked');
  }
} 