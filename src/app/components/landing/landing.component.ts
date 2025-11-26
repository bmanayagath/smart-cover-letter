import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  @Output() navigateToUpload = new EventEmitter<void>();
  @Output() navigateToLogin = new EventEmitter<void>();

  public isLoggedIn$: Observable<boolean>;

  features = [
    {
      icon: 'rocket',
      title: 'AI-Powered Writing',
      description: 'Our advanced AI analyzes your resume and creates personalized cover letters that highlight your strengths.'
    },
    {
      icon: 'globe',
      title: 'Location-Specific Content',
      description: 'Tone, spelling, and cultural style adjusted for the target region (US, UK, Canada, Australia, GCC, India, Singapore, Malaysia and more).' 
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

  constructor(private auth: AuthService) {
    this.isLoggedIn$ = this.auth.currentUser$.pipe(map(u => !!u));
  }

  ngOnInit(): void {
  }

  onGetStarted(): void {
    this.navigateToUpload.emit();
  }

  onSignIn(): void {
    this.navigateToLogin.emit();
  }
}
