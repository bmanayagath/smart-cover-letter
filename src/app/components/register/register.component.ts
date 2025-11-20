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
    // hide after duration
    setTimeout(() => (this.toastVisible = false), duration);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      Email: this.registerForm.value.email,
      Password: this.registerForm.value.password
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.errorMessage = '';
        this.successMessage = 'Registration successful — redirecting to login...';

        // show toast
        this.showToast(this.successMessage, 'success', 1500);

        // try router navigation; fallback to full-page redirect if Router doesn't navigate
        setTimeout(async () => {
          try {
            const nav = await this.router.navigate(['/login']);
            if (!nav) {
              // fallback if router couldn't navigate
              window.location.href = '/login';
            }
          } catch {
            window.location.href = '/login';
          }
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.successMessage = '';
        const msg = err?.error?.message || 'Registration failed';
        this.errorMessage = msg;
        this.showToast(msg, 'error', 3000);
      }
    });
  }

  onLogin(): void {
    // immediate navigation / fallback
    try {
      this.router.navigate(['/login']).then(ok => { if (!ok) window.location.href = '/login'; });
    } catch {
      window.location.href = '/login';
    }
  }
}
