import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => {
            this.authService.setToken(response.accessToken);
            return AuthActions.loginSuccess({ response });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message || 'Login failed' })))
        )
      )
    )
  );

  // Login Success Effect
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  // Register Effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ user }) =>
        this.authService.register(user).pipe(
          map((response) => {
            this.authService.setToken(response.accessToken);
            return AuthActions.registerSuccess({ response });
          }),
          catchError((error) => of(AuthActions.registerFailure({ error: error.message || 'Registration failed' })))
        )
      )
    )
  );

  // Register Success Effect
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())) // Always logout locally even if API fails
        )
      )
    )
  );

  // Logout Success Effect
  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.authService.removeToken();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  // Check Auth Status Effect
  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map((user) => AuthActions.checkAuthStatusSuccess({ user })),
          catchError(() => of(AuthActions.checkAuthStatusFailure()))
        )
      )
    )
  );
} 