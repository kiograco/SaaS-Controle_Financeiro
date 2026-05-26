import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, PageHeaderComponent, MetricCardComponent, MinutesPipe, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Relatórios de Ponto" subtitle="Indicadores mensais de horas trabalhadas, extras e faltas." eyebrow="Relatórios" />
      <section class="card-surface filters">
        <form [formGroup]="form" class="filter-form">
          <input type="month" formControlName="month">
          <button mat-stroked-button type="button" (click)="load()">Aplicar mês</button>
        </form>
      </section>
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
  styles: [`.filters, section.card-surface { padding: 1rem; } .filter-form { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; } .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; } @media (max-width: 900px) { .cards { grid-template-columns: 1fr; } }`]
})
export class TimeReportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(TimeReportService);
  readonly report = signal<MonthlyTimeReport | null>(null);
  readonly form = this.fb.nonNullable.group({
    month: new Date().toISOString().slice(0, 7)
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const month = params.get('month');
      if (month) {
        this.form.patchValue({ month }, { emitEvent: false });
        this.load();
      }
    });

    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.report.set(null);
        return;
      }
      this.load();
    }, { allowSignalWrites: true });
  }

  load(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      return;
    }
    const { month } = this.form.getRawValue();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month },
      replaceUrl: true
    });
    this.service.monthly(companyId, month).subscribe((report) => this.report.set(report));
  }
}
