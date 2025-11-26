import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent {
  hiringManager = '';
  companyName = '';
  jobDescription = '';
  @Input() uploadedFilename: string | null = null;
  regionStyle = '';

  regionStyleOptions = [
    'United States (US)',
    'United Kingdom (UK)',
    'Canada',
    'Europe (General)',
    'Australia',
    'Middle East (GCC)',
    'India',
    'Singapore',
    'Malaysia',
    'Global Remote Style',
    'Corporate Style',
    'Startup Style'
  ];

  constructor() {
    // try to read navigation state (if coming from upload)
    try {
      const state = (history && history.state) ? history.state : null;
      if (state && state.filename) {
        this.uploadedFilename = state.filename;
      }
    } catch {}
  }

  submit() {
    // for now just log the values; you can wire this to an API later
    console.log('Job details submitted', {
      hiringManager: this.hiringManager,
      companyName: this.companyName,
      jobDescription: this.jobDescription,
      uploadedFilename: this.uploadedFilename
    });
    alert('Job details saved (demo)');
  }
}
