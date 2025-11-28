import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResumeUploadService } from './services/resume-upload.service';
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
  generatedPdfUrl: string | null = null;
  isGenerating = false;
  generateMessage = 'AI is generating your cover letter...';

  constructor(private resumeService: ResumeUploadService) {}

  private onNavigate = (e: Event) => {
    // set a sample/placeholder while generation would run
    this.generatedCoverLetter = "";
    this.currentPage = 'cover-preview';
  };

  onJobSave = (payload: any) => {
    debugger;
    // clear prior PDF url if any
    if (this.generatedPdfUrl) {
      try { URL.revokeObjectURL(this.generatedPdfUrl); } catch {}
      this.generatedPdfUrl = null;
    }
    // show placeholder or loader; for now, clear text
    this.generatedCoverLetter = null;
    this.currentPage = 'cover-preview';

    // call backend to generate PDF
    this.isGenerating = true;
    try {
      this.resumeService.generateCoverLetter(payload).subscribe({
        next: (blob: Blob) => {
          this.isGenerating = false;
          try {
            this.generatedPdfUrl = URL.createObjectURL(blob);
          } catch (err) {
            console.error('Could not create PDF URL', err);
          }
        },
        error: (err) => {
          this.isGenerating = false;
          console.error('Generate cover letter failed', err);
          this.generatedCoverLetter = 'Failed to generate cover letter PDF.';
        }
      });
    } catch (err) {
      this.isGenerating = false;
      console.error(err);
      this.generatedCoverLetter = 'Failed to generate cover letter PDF.';
    }
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
