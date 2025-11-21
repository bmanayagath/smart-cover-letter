import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-auth-callback',
	standalone: true,
	imports: [CommonModule],
	template: `<div class="callback-wrap" style="padding:24px;font-family:inherit;color:var(--text-color,#111)">Processing login…</div>`
})
export class AuthCallbackComponent implements OnInit {
	constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

	ngOnInit(): void {
		// try query param first
		const q = this.route.snapshot.queryParamMap;
		const tokenFromQuery = q.get('token') || q.get('access_token') || q.get('accessToken');
		if (tokenFromQuery) return this.finish(tokenFromQuery, q.get('targetOrigin'), q.get('returnUrl'));

		// check fragment like #token=...
		this.route.fragment.subscribe(fragment => {
			if (!fragment) return this.fail();
			const params = new URLSearchParams(fragment);
			const t = params.get('token') || params.get('access_token') || params.get('accessToken');
			const targetOrigin = params.get('targetOrigin');
			const returnUrl = params.get('returnUrl');
			if (t) this.finish(t, targetOrigin, returnUrl);
			else this.fail();
		});
	}
	private finish(token: string, targetOrigin?: string | null, returnUrl?: string | null) {
		// Prefer posting to opener when present
		try {
			if (window.opener && !window.opener.closed && typeof window.opener.postMessage === 'function') {
				const payload = { type: 'oauth_token', token };
				// If backend provided a targetOrigin use it; otherwise use '*' to ensure cross-origin delivery.
				const origin = targetOrigin || '*';
				try {
					window.opener.postMessage(payload, origin);
				} catch (e) {
					// last resort: try permissive target
					window.opener.postMessage(payload, '*');
				}
				// close popup
				window.close();
				return;
			}
		} catch (err) {
			// ignore and fallback
		}

		// fallback: set token in this window and navigate back to app or provided returnUrl
		this.auth.setToken(token);
		const dest = returnUrl || '/';
		setTimeout(() => this.router.navigate([dest]), 600);
	}

	private fail() {
		// fallback: navigate to login
		this.router.navigate(['/login']);
	}
}
