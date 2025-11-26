import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandingComponent } from './components/landing/landing.component';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';
import { JobFormComponent } from './components/job-form/job-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CoverLetterPreviewComponent } from './components/cover-letter-preview/cover-letter-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, LandingComponent, ResumeUploadComponent, JobFormComponent, LoginComponent, RegisterComponent, CoverLetterPreviewComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AI Cover Letter Generator';
  currentPage: 'landing' | 'home' | 'login' | 'register' | 'job-form' | 'cover-preview' = 'landing';
  generatedCoverLetter: string | null = null;

  private onNavigate = (e: Event) => {
    // set a sample/placeholder while generation would run
    this.generatedCoverLetter = `Dear Hiring Manager,

Thank you for reviewing my application. I'm excited about the opportunity and believe my experience aligns well with the role.

I look forward to discussing how I can contribute to your team.

Sincerely,\n[Your Name]`;
    this.currentPage = 'cover-preview';
  };

  showLoginPage(): void {
    this.currentPage = 'login';
  }

  showHomePage(): void {
    this.currentPage = 'home';
  }

  showRegisterPage(): void {
    this.currentPage = 'register';
  }

  showLandingPage(): void {
    this.currentPage = 'landing';
  }

  showJobForm(): void {
    this.currentPage = 'job-form';
  }

  showCoverPreview(): void {
    this.currentPage = 'cover-preview';
  }

  ngOnInit(): void {
    window.addEventListener('navigateToCoverPreview', this.onNavigate as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('navigateToCoverPreview', this.onNavigate as EventListener);
  }
}
