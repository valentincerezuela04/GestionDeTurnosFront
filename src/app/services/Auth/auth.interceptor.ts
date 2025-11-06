import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/API';
import { AuthService } from './auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApi = req.url.startsWith(API_CONFIG.baseUrl);
    let modified = isApi ? req.clone({ withCredentials: true }) : req;

    const token = this.auth.getToken();
    if (token) {
      modified = modified.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(modified);
  }
}
