import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/API';
import {
  AppRole,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../../models/auth.model';
import { take, tap } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${API_CONFIG.baseUrl}/auth`;
  private http = inject(HttpClient);

  user = signal<AuthUser | null>(this.getUserFromStorage());

  getUserInfo() {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap((res) => {
        const updated = this.mapToAuthUser(res, this.user());
        this.persistUser(updated);
      })
    );
  }

  login(data: LoginRequest) {
    return this.http
      .post<any>(`${this.baseUrl}/login`, data, { withCredentials: true })
      .pipe(
        tap((res) => {
          const merged = this.mapToAuthUser(res, this.user());
          this.persistUser(merged);
          this.hydrateUserFromProfile();
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

  hasRole(...roles: AppRole[]): boolean {
    const user = this.user();
    if (!user) {
      return false;
    }
    const userRole =
      this.normalizeRole((user as any)?.rol) ??
      this.normalizeRole((user as any)?.role);
    if (!userRole) {
      return false;
    }
    if (userRole === 'ADMIN') {
      return true;
    }
    if (roles.length === 0) {
      return true;
    }
    return roles.includes(userRole);
  }


  private getUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      return this.mapToAuthUser(parsed);
    } catch {
      return null;
    }
  }

  private hydrateUserFromProfile(): void {
    this.getUserInfo().pipe(take(1)).subscribe({ error: () => {} });
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  private mapToAuthUser(source: any, fallback?: AuthUser | null): AuthUser {
    const fallbackRole = fallback
      ? this.normalizeRole((fallback as any)?.rol ?? (fallback as any)?.role)
      : null;
    const normalizedRole =
      this.normalizeRole(source?.rol ?? source?.role) ?? fallbackRole ?? 'CLIENTE';

    return {
      id: source?.id ?? fallback?.id ?? 0,
      nombre: source?.nombre ?? fallback?.nombre ?? '',
      rol: normalizedRole,
      email: source?.email ?? (fallback as any)?.email ?? '',
      token: source?.token ?? fallback?.token ?? '',
    };
  }

  private normalizeRole(value: unknown): AppRole | null {
    if (typeof value !== 'string') {
      return null;
    }
    const cleaned = value.trim().toUpperCase().replace(/^ROLE_/, '');
    if (cleaned === 'ADMIN' || cleaned === 'EMPLEADO' || cleaned === 'CLIENTE') {
      return cleaned as AppRole;
    }
    return null;
  }
}
