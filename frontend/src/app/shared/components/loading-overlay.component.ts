import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="loading.loading()">
      <div class="spinner card-surface">
        <div class="dot"></div>
        <p>Carregando dados...</p>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(6, 14, 18, 0.28);
      display: grid;
      place-items: center;
      z-index: 2000;
      backdrop-filter: blur(4px);
    }
    .spinner {
      padding: 1.2rem 1.5rem;
      min-width: 220px;
      text-align: center;
    }
    .dot {
      width: 42px;
      height: 42px;
      margin: 0 auto 0.85rem;
      border-radius: 50%;
      border: 4px solid rgba(14, 143, 115, 0.18);
      border-top-color: var(--primary);
      animation: spin 0.85s linear infinite;
    }
    p { margin: 0; color: var(--text-soft); }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingOverlayComponent {
  readonly loading = inject(LoadingService);
}
