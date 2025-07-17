import { createAction, props } from '@ngrx/store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Login Actions
export const login = createAction('[Auth] Login', props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ response: LoginResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Register Actions
export const register = createAction('[Auth] Register', props<{ user: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ response: LoginResponse }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

// Logout Actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Check Auth Status
export const checkAuthStatus = createAction('[Auth] Check Auth Status');
export const checkAuthStatusSuccess = createAction('[Auth] Check Auth Status Success', props<{ user: any }>());
export const checkAuthStatusFailure = createAction('[Auth] Check Auth Status Failure'); 