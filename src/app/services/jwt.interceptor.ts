import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const token = this.auth.getToken();
      // don't attach token for auth endpoints (login/register and common external callbacks)
      const skipPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/google-login', '/api/auth/external', '/api/auth/me'];
      const url = req.url || '';
      const shouldSkip = skipPaths.some(p => url.includes(p));
      if (!token || shouldSkip) {
        return next.handle(req);
      }

      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(authReq);
    } catch (e) {
      return next.handle(req);
    }
  }
}
