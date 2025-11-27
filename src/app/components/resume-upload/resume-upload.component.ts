import { Component, EventEmitter, Output } from '@angular/core';
import { ResumeUploadService } from '../../services/resume-upload.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './resume-upload.component.html',
  styleUrls: ['./resume-upload.component.css']
})
export class ResumeUploadComponent {
  isDragging = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  loaderMessage = 'Uploading resume...';

  @Output() uploadComplete = new EventEmitter<{ filename?: string; response?: any }>();

  constructor(private uploadService: ResumeUploadService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }

    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    this.selectedFile = file;
    console.log('File selected:', file.name);
  }

  upload(): void {
    this.uploadError = null;
    this.uploadSuccess = false;
    if (!this.selectedFile) {
      this.uploadError = 'No file selected';
      return;
    }
    this.loaderMessage = 'Uploading resume... AI is analyzing your resume.';
    this.uploading = true;
    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadSuccess = true;
        try {
          this.uploadComplete.emit({ filename: this.selectedFile?.name, response: res });
        } catch {}
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = (err?.error?.message || err?.message || String(err));
      }
    });
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
  }
}
