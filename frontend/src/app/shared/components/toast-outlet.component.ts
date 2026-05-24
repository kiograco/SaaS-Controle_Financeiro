import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      <article *ngFor="let toast of toastService.messages()" class="toast card-surface" [class.error]="toast.type === 'error'">
        <div>
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button type="button" (click)="toastService.dismiss(toast.id)">×</button>
      </article>
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: grid;
      gap: 0.75rem;
      z-index: 2200;
      width: min(360px, calc(100vw - 2rem));
    }
    .toast {
      padding: 1rem 1rem 1rem 1.1rem;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      border-left: 4px solid var(--primary);
    }
    .toast.error { border-left-color: var(--danger); }
    strong { display: block; margin-bottom: 0.2rem; }
    p { margin: 0; color: var(--text-soft); }
    button {
      border: 0;
      background: transparent;
      color: var(--text-soft);
      font-size: 1.4rem;
      cursor: pointer;
    }
  `]
})
export class ToastOutletComponent {
  readonly toastService = inject(ToastService);
}
