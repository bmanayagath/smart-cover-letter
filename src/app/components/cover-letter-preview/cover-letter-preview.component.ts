import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoaderComponent } from '../loader/loader.component';

const SAMPLE_COVER_LETTER = ``;

@Component({
  selector: 'app-cover-letter-preview',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './cover-letter-preview.component.html',
  styleUrls: ['./cover-letter-preview.component.css']
})
export class CoverLetterPreviewComponent implements OnDestroy, OnChanges {
  @Input() coverLetter: string | null = SAMPLE_COVER_LETTER;
  @Input() companyName?: string | null;
  @Input() hiringManager?: string | null;
  @Input() filename?: string | null;
  @Input() pdfUrlInput?: string | null;
  @Input() loading: boolean = false;
  @Input() loadingMessage: string | null = null;

  @Output() close = new EventEmitter<void>();
  pdfUrl: string | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  // PDF.js renderer state
  useCustomRenderer = false;
  pdfLoading = false;
  pdfScale = 1.0;
  private currentPdfUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfUrlInput']) {
      const v = changes['pdfUrlInput'].currentValue as string | null | undefined;
      if (v) {
        try {
          // build an iframe-friendly URL that requests minimal viewer chrome
          // append common fragment params that many PDF viewers honor (hide toolbar/nav, fit width)
          const params = '#toolbar=0&navpanes=0&zoom=page-width';
          const iframeUrl = v.includes('#') ? v + '&' + params.replace('#','') : v + params;
          this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
          // attempt to render with PDF.js for a chrome-less UI
          this.currentPdfUrl = v;
          this.tryRenderWithPdfJs(v).catch(() => {
            this.useCustomRenderer = false;
          });
        } catch (e) {
          this.safePdfUrl = null;
        }
      } else {
        this.safePdfUrl = null;
      }
    }
  }

  private async tryRenderWithPdfJs(url: string) {
    this.pdfLoading = true;
    // progressive enhancement: try to load a pdfjs runtime from the page (via CDN)
    try {
      let pdfjsLib: any = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        // inject pdfjs script from CDN
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/pdfjs-dist/build/pdf.min.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = (e) => reject(e);
          document.head.appendChild(s);
        });
        pdfjsLib = (window as any).pdfjsLib;
      }
      if (!pdfjsLib) throw new Error('pdfjs not available');
      // set worker via CDN (no build-time dependency on worker file)
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js';

      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // render pages into the container
      const container = document.getElementById('pdfjs-render-container');
      if (!container) throw new Error('pdf container missing');
      // clear existing
      container.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        // get unscaled viewport to compute fit-to-width scale
        const unscaledViewport = page.getViewport({ scale: 1 });
        const containerWidth = Math.max(300, container.clientWidth || 800) * 0.95; // leave small padding
        const fitScale = (containerWidth / unscaledViewport.width) * this.pdfScale;
        const viewport = page.getViewport({ scale: fitScale });

        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.margin = '12px auto';
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';
        // scale the context for high-DPI
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

        container.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }

      this.useCustomRenderer = true;
    } finally {
      this.pdfLoading = false;
    }
  }

  zoomIn() {
    this.pdfScale = Math.min(3, this.pdfScale + 0.25);
    if (this.currentPdfUrl) this.tryRenderWithPdfJs(this.currentPdfUrl);
  }

  zoomOut() {
    this.pdfScale = Math.max(0.5, this.pdfScale - 0.25);
    if (this.currentPdfUrl) this.tryRenderWithPdfJs(this.currentPdfUrl);
  }

  downloadPdf() {
    const url = this.currentPdfUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename ? `${this.filename}-cover-letter.pdf` : 'cover-letter.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  printPdf() {
    if (!this.currentPdfUrl) return;
    const w = window.open(this.currentPdfUrl, '_blank');
    if (w) w.print();
  }

  private escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
