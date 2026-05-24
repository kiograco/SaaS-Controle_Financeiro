import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="header">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ng-content />
    </section>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.78rem;
    }
    .subtitle {
      margin: 0.4rem 0 0;
      color: var(--text-soft);
    }
    @media (max-width: 900px) {
      .header { flex-direction: column; }
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() eyebrow = 'Painel';
}
