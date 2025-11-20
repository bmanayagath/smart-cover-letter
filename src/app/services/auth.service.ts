import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  Email: string;
  Password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<any> {
    const url = `${this.base}/api/auth/register`;
    return this.http.post(url, payload);
  }
}