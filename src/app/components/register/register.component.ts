import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = ''; // kept for compatibility

  // hold multiple server validation messages
  errorMessages: string[] = [];

  // new toast state
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: AbstractControl) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordMismatch: true };
  }

  private showToast(message: string, type: 'success' | 'error' = 'success', duration = 2500) {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), duration);
  }

  private parseServerErrors(err: any): string[] {
    const out: string[] = [];

    const body = err?.error ?? err;

    // common structure: an array of { code, description }
    if (Array.isArray(body)) {
      for (const item of body) {
        if (typeof item === 'string') out.push(item);
        else if (item?.description) out.push(item.description);
        else if (item?.message) out.push(item.message);
        else out.push(JSON.stringify(item));
      }
      return out;
    }

    // structure: { errors: [...] }
    if (body?.errors && Array.isArray(body.errors)) {
      for (const item of body.errors) {
        if (typeof item === 'string') out.push(item);
        else if (item?.description) out.push(item.description);
        else if (item?.message) out.push(item.message);
        else out.push(JSON.stringify(item));
      }
      return out;
    }

    // structure: { message: '...' } or simple string
    if (typeof body === 'string') return [body];
    if (typeof body.error === 'string') return [body.error];
    if (body?.message) return [body.message];

    // fallback to generic message from HttpErrorResponse
    if (err?.message) return [err.message];

    return ['Registration failed'];
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.errorMessages = [];

    const payload = {
      Email: this.registerForm.value.email,
      Password: this.registerForm.value.password
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.errorMessage = '';
        this.errorMessages = [];
        this.successMessage = 'Registration successful';

        this.showToast(this.successMessage, 'success', 1500);

        setTimeout(async () => {
         await this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.successMessage = '';
        // parse server validation messages
        const msgs = this.parseServerErrors(err);
        this.errorMessages = msgs;
        this.errorMessage = msgs.length ? msgs.join(' • ') : (err?.error?.message || 'Registration failed');
        this.showToast(this.errorMessage, 'error', 4000);
      }
    });
  }

  onLogin(): void {
    try {
      this.router.navigate(['/login']).then(ok => { if (!ok) window.location.href = '/login'; });
    } catch {
      window.location.href = '/login';
    }
  }
}
