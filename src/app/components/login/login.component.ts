import { Component, Output, EventEmitter, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output() navigateToRegister = new EventEmitter<void>();
  
  email: string = '';
  password: string = '';

  private messageHandler = (event: MessageEvent) => {
    console.log('[login] message event received:', event);

    // Accept messages from same origin or from configured backend origin
    const backendOrigin = (() => {
      try { return new URL(environment.apiBaseUrl).origin; } catch { return null; }
    })();

    if (event.origin !== window.location.origin && event.origin !== backendOrigin) {
      console.warn('[login] ignoring message from origin:', event.origin);
      return;
    }

    const data = event.data as any;
    if (!data) return;
    const token = data.token || (data.payload && data.payload.token);
    if (token) {
      console.log('[login] got token via postMessage');
      this.auth.setToken(token);
      const home = (environment as any).homeRoute || '/';
      this.ngZone.run(() => this.router.navigateByUrl(home));
    }
  };

  ngOnInit(): void {
    console.log('[login] adding message listener');
    window.addEventListener('message', this.messageHandler);
    // also navigate to landing whenever auth state becomes non-null
    this._userSub = this.auth.currentUser$.subscribe(u => {
      if (u) {
        console.log('[login] user observed, navigating to landing');
        window.location.reload();
        // const home = (environment as any).homeRoute || '/';
        // this.ngZone.run(() => this.router.navigateByUrl(home));
      }
    });
  }

  ngOnDestroy(): void {
    try { window.removeEventListener('message', this.messageHandler); } catch {}
    try { this._userSub?.unsubscribe(); } catch {}
  }

  onLogin(): void {
    // call backend login and set token via AuthService
    this.auth.login({ Email: this.email, Password: this.password }).subscribe({
      next: token => {
        if (token) {
          console.log('[login] login succeeded, navigating home');
          const home = (environment as any).homeRoute || '/';
          this.ngZone.run(() => this.router.navigateByUrl(home));
        } else {
          console.warn('[login] login returned no token');
        }
      },
      error: err => {
        console.error('[login] login failed', err);
        // TODO: show user-friendly error message
      }
    });
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Add forgot password logic here
  }

  onRegister(): void {
    this.navigateToRegister.emit();
  } 

  constructor(private auth: AuthService, private router: Router, private ngZone: NgZone) {}

  private _userSub: Subscription | null = null;

  // open OAuth in popup and receive token via postMessage from callback
  onGoogle() {
    const popupPath = (environment as any).popupRedirectPath || '/auth/auth-callback';
    const redirectUri = encodeURIComponent(window.location.origin + popupPath);
    const url = `${environment.apiBaseUrl}/api/auth/google-login?redirectUri=${redirectUri}`;

    const popup = window.open(url, 'googleLogin', 'width=500,height=700');
    if (!popup) {
      // popup blocked, fallback to full redirect
      window.location.href = url;
      return;
    }

    // Poll for same-origin redirect: if backend redirects popup to a frontend URL
    const poll = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(poll);
          return;
        }

        // If popup has been redirected to our origin, we can read its URL/search
        if (popup.location && popup.location.origin === window.location.origin) {
          const params = new URLSearchParams(popup.location.search || popup.location.hash.replace('#', '?'));
            const token = params.get('token') || params.get('access_token') || params.get('accessToken');
            const returnUrl = params.get('returnUrl');
            if (token) {
              console.log('[login] got token via popup redirect');
              this.auth.setToken(token);
              try { popup.close(); } catch {}
              clearInterval(poll);
              this.ngZone.run(() => this.router.navigateByUrl(returnUrl || (environment as any).homeRoute || '/'));
            }
        }
      } catch (e) {
        // cross-origin until redirect happens; ignore errors
      }
    }, 300);
  }

  // optional: github redirect if desired
  onGithub(): void {
    const url = `${environment.apiBaseUrl}/api/auth/external/github`;
    window.location.href = url;
  }
}
