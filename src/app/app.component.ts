import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ResumeUploadComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AI Cover Letter Generator';
  currentPage: 'home' | 'login' | 'register' = 'home';

  showLoginPage(): void {
    this.currentPage = 'login';
  }

  showHomePage(): void {
    this.currentPage = 'home';
  }

  showRegisterPage(): void {
    this.currentPage = 'register';
  }
}
