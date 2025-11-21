import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  name?: string;
  email?: string;
  sub?: string;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;
  private tokenKey = 'auth_token';
  private _currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) this.setUserFromToken(token);
  }

  register(payload: { Email: string; Password: string }) {
    const url = `${this.base}/api/auth/register`;
    return this.http.post(url, payload);
  }

  login(payload: { Email: string; Password: string }) {
    const url = `${this.base}/api/auth/login`;
    return this.http.post<{ token: string }>(url, payload).pipe(
      map(resp => resp && resp.token ? resp.token : null),
      map(token => {
        if (token) this.setToken(token);
        return token;
      })
    );
  }

  setToken(token: string) {
    try {
      localStorage.setItem(this.tokenKey, token);
      this.setUserFromToken(token);
    } catch {}
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    this._currentUser.next(null);
  }

  logout() {
    this.clearToken();
    // optionally call backend logout endpoint
  }

  private setUserFromToken(token: string) {
    const payload = this.decodeJwtPayload(token);
    if (payload) {
      const user: User = {
        name: payload.name || payload.fullname || payload.given_name,
        email: payload.email,
        sub: payload.sub,
        ...payload
      };
      this._currentUser.next(user);
    } else {
      this._currentUser.next(null);
    }
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    } catch {
      return null;
    }
  }

  // fallback to fetch profile from backend if token has no user info
  fetchProfile(): Observable<User | null> {
    const url = `${this.base}/api/auth/me`;
    return this.http.get<User>(url).pipe(
      map(u => {
        this._currentUser.next(u);
        return u;
      }),
      catchError(() => of(null))
    );
  }
}