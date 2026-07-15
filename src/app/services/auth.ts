import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Api } from './client/api';

export interface LoginCredentials {
  login: string;
  passwd: string;
}

export interface AuthUser {
  full_name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const ACCESS_USER_STORAGE_KEY = 'authUser';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly api = inject(Api);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse>('users/auth/login', credentials)
      .pipe(
        tap((response) => {
          this.setAccessToken(response.accessToken);

          const { full_name, email } = response.user;

          this.setAuthUser({ ...response.user, full_name, email });
        })
      );
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  getAuthUser(): AuthUser | null {
    const user = sessionStorage.getItem(ACCESS_USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  }

  setAuthUser(user: AuthUser): void {
    sessionStorage.setItem(ACCESS_USER_STORAGE_KEY, JSON.stringify(user));
  }


  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  clearAuthUser(): void {
    sessionStorage.removeItem(ACCESS_USER_STORAGE_KEY);
  }

  logout(): void {
    this.clearAccessToken();
    this.clearAuthUser();
  }
}
