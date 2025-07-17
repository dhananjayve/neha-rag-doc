import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.accessToken,
    loading: false,
    error: null,
    isAuthenticated: true,
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
  })),
  
  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.accessToken,
    loading: false,
    error: null,
    isAuthenticated: true,
  })),
  
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
  })),
  
  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  })),
  
  // Check Auth Status
  on(AuthActions.checkAuthStatus, (state) => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.checkAuthStatusSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isAuthenticated: true,
  })),
  
  on(AuthActions.checkAuthStatusFailure, (state) => ({
    ...state,
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
  }))
); 