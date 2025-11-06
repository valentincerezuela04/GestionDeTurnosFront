import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/API';
import { AuthUser, LoginRequest, RegisterRequest } from '../../models/auth.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${API_CONFIG.baseUrl}/auth`;
  private http = inject(HttpClient);

  user = signal<AuthUser | null>(this.getUserFromStorage());

  getUserInfo() {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }

  login(data: LoginRequest) {
    return this.http
      .post<any>(`${this.baseUrl}/login`, data, { withCredentials: true })
      .pipe(
        tap((res) => {
          const stored = this.getUserFromStorage() || ({} as any);
          const merged = { id: (res as any)?.id ?? (stored as any)?.id, rol: (res as any)?.rol ?? (stored as any)?.rol ?? 'USUARIO', nombre: (res as any)?.nombre ?? (stored as any)?.nombre } as AuthUser;
          localStorage.setItem('user', JSON.stringify(merged));
          this.user.set(merged);
        })
      );
  }

  register(data: RegisterRequest) {
    return this.http.post<string>(`${this.baseUrl}/register`, data, {
      responseType: 'text' as 'json',
      withCredentials: true,
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
  }

  getToken(): string | null {
    return null;
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  private getUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}

