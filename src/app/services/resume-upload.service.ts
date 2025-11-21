import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResumeUploadService {
  private baseUrl = environment.resumeUploadApiUrl;
  private uploadEndpoint = `${this.baseUrl}/coverletter/upload`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file, file.name);

    return this.http.post(this.uploadEndpoint, form).pipe(
      catchError(() => {
        // Fallback: send JSON { filename, data } where data is base64
        return new Observable<any>((observer) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const comma = result.indexOf(',');
            const base64 = comma >= 0 ? result.slice(comma + 1) : result;
            const payload = { filename: file.name, data: base64 };
            const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
            this.http.post(this.uploadEndpoint, payload, { headers }).subscribe({
              next: (res) => {
                observer.next(res);
                observer.complete();
              },
              error: (err) => {
                observer.error(err);
              }
            });
          };
          reader.onerror = () => {
            observer.error(new Error('Could not read file for fallback upload'));
          };
          reader.readAsDataURL(file);
        });
      })
    );
  }
}
