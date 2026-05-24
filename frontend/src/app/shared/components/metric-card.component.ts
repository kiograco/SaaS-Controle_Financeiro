import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrlPipe } from '../pipes/brl.pipe';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, BrlPipe],
  template: `
    <article class="metric card-surface">
      <header>{{ title }}</header>
      <strong *ngIf="currency; else plain">{{ numericValue | brl }}</strong>
      <ng-template #plain><strong>{{ value }}</strong></ng-template>
      <p>{{ helper }}</p>
    </article>
  `,
  styles: [`
    .metric { padding: 1.25rem; display: grid; gap: 0.45rem; }
    header { color: var(--text-soft); font-weight: 700; }
    strong { font-size: 1.65rem; font-family: 'Manrope', sans-serif; }
    p { margin: 0; color: var(--text-soft); }
  `]
})
export class MetricCardComponent {
  @Input() title = '';
  @Input() helper = '';
  @Input() value: string | number = 0;
  @Input() currency = true;

  get numericValue(): number {
    return typeof this.value === 'number' ? this.value : Number(this.value) || 0;
  }
}
