import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MaterialCoreModule } from '../../../shared/material/material-core.module';
import { MaterialFeedbackModule } from '../../../shared/material/material-feedback.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as AuthSelectors from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialCoreModule,
    MaterialFeedbackModule,
    RouterModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  
  loginForm: FormGroup;
  private destroy$ = new Subject<void>();

  // Convert observables to signals
  loading = toSignal(this.store.select(AuthSelectors.selectAuthLoading));
  error = toSignal(this.store.select(AuthSelectors.selectAuthError));

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Subscribe to error changes
    this.store.select(AuthSelectors.selectAuthError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.snackBar.open(error, 'Close', { duration: 3000 });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ credentials: this.loginForm.value }));
    }
  }
} 