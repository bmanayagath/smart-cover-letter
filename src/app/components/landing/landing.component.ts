import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  @Output() navigateToUpload = new EventEmitter<void>();
  @Output() navigateToLogin = new EventEmitter<void>();

  features = [
    {
      icon: 'rocket',
      title: 'AI-Powered Writing',
      description: 'Our advanced AI analyzes your resume and creates personalized cover letters that highlight your strengths.'
    },
    {
      icon: 'target',
      title: 'Job-Specific Content',
      description: 'Tailored content that matches the job description and company culture, increasing your interview chances.'
    },
    {
      icon: 'clock',
      title: 'Ready in Minutes',
      description: 'Generate professional cover letters in under 5 minutes. No more hours of writing and editing.'
    },
    {
      icon: 'check',
      title: 'ATS-Optimized',
      description: 'Our letters are optimized to pass Applicant Tracking Systems and reach human recruiters.'
    }
  ];

  onGetStarted(): void {
    this.navigateToUpload.emit();
  }

  onSignIn(): void {
    this.navigateToLogin.emit();
  }
}
