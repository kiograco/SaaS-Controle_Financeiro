import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { TimeReportService } from '../../../core/services/time-report.service';
import { MonthlyTimeReport } from '../../../core/models/time-tracking.models';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card.component';
import { MinutesPipe } from '../../../shared/pipes/minutes.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-time-reports-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, MetricCardComponent, MinutesPipe, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Relatórios de Ponto" subtitle="Indicadores mensais de horas trabalhadas, extras e faltas." eyebrow="Relatórios" />
      <app-empty-state *ngIf="!report()" title="Selecione uma empresa" description="Os indicadores serão carregados assim que uma empresa for selecionada." />
      <section class="cards" *ngIf="report() as data">
        <app-metric-card title="Total de horas trabalhadas" helper="Consolidado do período" [currency]="false" [value]="(data.totalMinutosTrabalhados | minutes)" />
        <app-metric-card title="Horas extras" helper="Banco de horas positivo" [currency]="false" [value]="(data.totalHorasExtras | minutes)" />
        <app-metric-card title="Faltas" helper="Tempo faltante acumulado" [currency]="false" [value]="(data.totalMinutosEmFalta | minutes)" />
      </section>
      <section class="card-surface" *ngIf="report() as data">
        <h3>Resumo por funcionário</h3>
        <ul>
          <li *ngFor="let employee of data.funcionarios">
            {{ employee.employeeName }}: {{ employee.workedMinutes | minutes }} trabalhados, {{ employee.overtimeMinutes | minutes }} extras.
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [`.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; } section.card-surface { padding: 1rem; } @media (max-width: 900px) { .cards { grid-template-columns: 1fr; } }`]
})
export class TimeReportsPageComponent {
  private readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(TimeReportService);
  readonly report = signal<MonthlyTimeReport | null>(null);

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.report.set(null);
        return;
      }
      this.service.monthly(companyId, new Date().toISOString().slice(0, 7)).subscribe((report) => this.report.set(report));
    }, { allowSignalWrites: true });
  }
}
