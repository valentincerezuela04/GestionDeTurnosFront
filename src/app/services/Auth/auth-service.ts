import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/API';
import { AppRole, AuthUser, LoginRequest, RegisterRequest } from '../../models/auth.model';
import { tap } from 'rxjs';
import { Rol } from '../../models/usuarios/rol';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private baseUrl = `${API_CONFIG.baseUrl}/auth`;
  private http = inject(HttpClient);


  user = signal<AuthUser | null>(this.getUserFromStorage());

  getUserInfo() {
    return this.http.get(`${this.baseUrl}/me`);
  }

  login(data:LoginRequest){
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, data).pipe(
      tap((res) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res));
      this.user.set(res);
  })
);}  

register(data:RegisterRequest){
  return this.http.post<string>(`${this.baseUrl}/register`, data,{
    responseType: 'text' as 'json'
  })
}

logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.user.set(null);
}



getToken(): string | null {
    return localStorage.getItem('token');
  }

isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  hasRole(...roles: AppRole[]): boolean {
    const user = this.user();
    if(!user) {
      return false;
    }
    return roles.includes(user.rol as AppRole);
  }


  private getUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

}


