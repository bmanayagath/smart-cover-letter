import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    hiringManager: string;
    companyName: string;
    jobDescription: string;
    regionStyle: string;
    uploadedFilename?: string | null;
  }>();

  goBack() {
    try { this.back.emit(); } catch {}
  }

  constructor() {
    // try to read navigation state (if coming from upload)
    try {
      const state = (history && history.state) ? history.state : null;
      if (state && state.filename) {
        this.uploadedFilename = state.filename;
      }
    } catch {}
  }

  submit(form?: NgForm) {

    if (form && form.invalid) {
      // mark all fields as touched so validation messages show
      try { form.form.markAllAsTouched(); 

            alert('Submitting job details...');
      } catch {}
      return;
    }

    // valid -> proceed: emit the validated job details so parent can navigate / call API
    const payload = {
      hiringManager: this.hiringManager,
      companyName: this.companyName,
      jobDescription: this.jobDescription,
      regionStyle: this.regionStyle,
      uploadedFilename: this.uploadedFilename
    };
    console.log('Job details submitted', payload);
    this.save.emit(payload);
    try { window.dispatchEvent(new CustomEvent('navigateToCoverPreview')); } catch {}
   
  }
}
