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
      if (shouldSkip) {
        // don't attach Authorization for these paths, but still forward request
        return next.handle(req);
      }

      const setHeaders: { [key: string]: string } = {};
      if (token) {
        // mask token when logging for privacy
        try {
          const masked = token.length > 10 ? token.slice(0, 6) + '...' + token.slice(-4) : '***';
        } catch {}
        setHeaders['Authorization'] = `Bearer ${token}`;
      }

      // Ensure we accept JSON responses by default
      if (!req.headers.has('Accept')) {
        setHeaders['Accept'] = 'application/json';
      }

      // Don't set Content-Type for FormData (browser will set boundary). For other bodies, default to JSON when not already present.
      const isFormData = req.body instanceof FormData;
      if (!isFormData && !req.headers.has('Content-Type')) {
        setHeaders['Content-Type'] = 'application/json';
      }

      const authReq = req.clone({ setHeaders });
      return next.handle(authReq);
    } catch (e) {
      return next.handle(req);
    }
  }
}
