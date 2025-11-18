import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() navigateToHome = new EventEmitter<void>();
  @Output() navigateToLogin = new EventEmitter<void>();

  onCreateCoverLetter(): void {
    this.navigateToHome.emit();
  }

  onLogin(): void {
    this.navigateToLogin.emit();
  }
}
