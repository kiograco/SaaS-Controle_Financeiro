import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, EmptyStateComponent],
  template: `
    <article class="card-surface chart-card">
      <header>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </header>
      <div *ngIf="loading" class="loading-box">Carregando gráfico...</div>
      <app-empty-state *ngIf="!loading && !hasData" [title]="emptyTitle" [description]="emptyDescription" />
      <canvas *ngIf="!loading && hasData" baseChart [type]="type" [data]="data" [options]="options"></canvas>
    </article>
  `,
  styles: [`
    .chart-card { padding: 1.25rem; }
    header { margin-bottom: 1rem; }
    header p { margin: 0.35rem 0 0; color: var(--text-soft); }
  `]
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() loading = false;
  @Input() hasData = false;
  @Input() emptyTitle = 'Sem dados';
  @Input() emptyDescription = 'Os gráficos aparecerão quando houver movimentações suficientes.';
  @Input() type: ChartConfiguration['type'] = 'bar';
  @Input() data: ChartConfiguration['data'] = { labels: [], datasets: [] };
  @Input() options: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
}
