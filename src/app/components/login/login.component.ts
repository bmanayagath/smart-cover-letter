import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Output() navigateToRegister = new EventEmitter<void>();
  
  email: string = '';
  password: string = '';

  onLogin(): void {
    console.log('Login attempt:', { email: this.email, password: '***' });
    // Add your login logic here
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Add forgot password logic here
  }

  onRegister(): void {
    this.navigateToRegister.emit();
  }
}
