import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Output() navigateToLogin = new EventEmitter<void>();
  
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Register attempt:', { email: this.email, password: '***' });
    // Add your registration logic here
  }

  onLogin(): void {
    this.navigateToLogin.emit();
  }
}
