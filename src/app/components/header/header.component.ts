import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

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

  public currentUser$: Observable<User | null>;
  public dropdownOpen = false;

  constructor(private auth: AuthService) {
    this.currentUser$ = this.auth.currentUser$;
  }

  private portalEl: HTMLElement | null = null;
  private outsideClickHandler = (e: MouseEvent) => {
    if (!this.portalEl) return;
    const target = e.target as Node | null;
    if (!target) return;
    // don't close when clicking inside portal
    if (this.portalEl.contains(target)) return;
    // don't close when clicking the trigger
    const trigger = document.getElementById('header-user-trigger');
    if (trigger && trigger.contains(target)) return;
    this.closePortal();
  };

  private repositionHandler = () => this.positionPortal();

  onCreateCoverLetter(): void {
    this.navigateToHome.emit();
  }

  onLogin(): void {
    this.navigateToLogin.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) this.createPortal();
    else this.destroyPortal();
  }

  logout(): void {
    this.auth.logout();
    this.closePortal();
    this.navigateToLogin.emit();
  }

  onSettings(): void {
    // placeholder: implement navigation to settings if needed
    this.closePortal();
  }
// TODO: implement navigation to settings if needed
  private createPortal() {
    if (this.portalEl) return;
    const trigger = document.getElementById('header-user-trigger');
    const el = document.createElement('div');
    el.className = 'user-dropdown open';
    el.setAttribute('role', 'menu');
    el.innerHTML = `
      <button class="dropdown-item" data-action="settings">SETTINGS</button>
      <button class="dropdown-item" data-action="logout">LOGOUT</button>
    `;

    // attach click handler for actions
    el.addEventListener('click', (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const actionEl = target.closest('[data-action]') as HTMLElement | null;
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');
      if (action === 'logout') this.logout();
      if (action === 'settings') this.onSettings();
    });

    document.body.appendChild(el);
    this.portalEl = el;
    // position and bind listeners
    this.positionPortal();
    window.addEventListener('click', this.outsideClickHandler, true);
    window.addEventListener('resize', this.repositionHandler);
    window.addEventListener('scroll', this.repositionHandler, true);
  }

  private destroyPortal() {
    if (!this.portalEl) return;
    try {
      this.portalEl.remove();
    } catch {}
    this.portalEl = null;
    window.removeEventListener('click', this.outsideClickHandler, true);
    window.removeEventListener('resize', this.repositionHandler);
    window.removeEventListener('scroll', this.repositionHandler, true);
  }

  private closePortal() {
    this.dropdownOpen = false;
    this.destroyPortal();
  }

  private positionPortal() {
    if (!this.portalEl) return;
    const trigger = document.getElementById('header-user-trigger');
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY + 8; // offset
    // set width to at least trigger width
    const minWidth = Math.max(160, rect.width + 20);
    Object.assign(this.portalEl.style, {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      minWidth: `${minWidth}px`,
    } as any);
  }

  ngOnDestroy(): void {
    this.destroyPortal();
  }
}
