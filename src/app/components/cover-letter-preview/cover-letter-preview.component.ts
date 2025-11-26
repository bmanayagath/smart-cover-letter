import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

const SAMPLE_COVER_LETTER = `Dear Hiring Manager,

I am writing to express my interest in the open position at your company. With a strong background in relevant skills and a track record of delivering results, I am confident I can contribute immediately to your team's success.

I have experience collaborating with cross-functional teams, managing priorities, and producing high-quality work under tight deadlines. I am excited about the opportunity to bring my expertise to your organization and help achieve your goals.

Thank you for considering my application. I look forward to the possibility of discussing how I can contribute to your team.

Sincerely,
[Your Name]`;

@Component({
  selector: 'app-cover-letter-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cover-letter-preview.component.html',
  styleUrls: ['./cover-letter-preview.component.css']
})
export class CoverLetterPreviewComponent {
  @Input() coverLetter: string | null = SAMPLE_COVER_LETTER;
  @Input() companyName?: string | null;
  @Input() hiringManager?: string | null;
  @Input() filename?: string | null;

  @Output() close = new EventEmitter<void>();
  pdfUrl: string | null = null;

  copy() {
    const text = this.coverLetter || '';
    if (!navigator.clipboard) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
      return;
    }
    navigator.clipboard.writeText(text).catch(() => {});
  }

  

  

  downloadAsTxt() {
    const text = this.coverLetter || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename ? `${this.filename}-cover-letter.txt` : 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  print() {
    const w = window.open('', '_blank');
    if (!w) return;
    const content = `
      <html>
        <head>
          <title>Cover Letter Preview</title>
          <style>body{font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial; padding:24px; color:#0f172a;} pre{white-space:pre-wrap; font-size:15px; line-height:1.5}</style>
        </head>
        <body>
          <pre>${this.escapeHtml(this.coverLetter || '')}</pre>
        </body>
      </html>`;
    w.document.open();
    w.document.write(content);
    w.document.close();
    w.focus();
    w.print();
  }

  closeClick() {
    this.close.emit();
  }

  private clearPdfUrl() {
    if (this.pdfUrl) {
      try { URL.revokeObjectURL(this.pdfUrl); } catch {}
      this.pdfUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.clearPdfUrl();
  }

  private escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
