import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/API';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  baseUrl = `${API_CONFIG.baseUrl}/auth`;


  http = inject(HttpClient);


  ObtenerUsuarioActual() {
    return this.http.get(`${this.baseUrl}/me`);
  }

}
