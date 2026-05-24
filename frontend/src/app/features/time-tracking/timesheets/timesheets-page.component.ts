import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { TimeSheetService } from '../../../core/services/time-sheet.service';
import { TimeSheet } from '../../../core/models/time-tracking.models';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MinutesPipe } from '../../../shared/pipes/minutes.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-timesheets-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, PageHeaderComponent, MinutesPipe, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Espelhos de Ponto" subtitle="Consulte horas trabalhadas, extras e faltantes por período." eyebrow="Gestão de Ponto" />
      <section class="card-surface filters">
        <form [formGroup]="form" class="form-grid">
          <input class="form-col-6" type="date" formControlName="startDate">
          <input class="form-col-6" type="date" formControlName="endDate">
        </form>
        <div class="actions">
          <button mat-stroked-button type="button" (click)="load()">Aplicar filtros</button>
        </div>
      </section>
      <app-empty-state *ngIf="!rows().length" title="Nenhum espelho encontrado" description="Ajuste os filtros ou recalcule o período desejado." />
      <section class="sheet-grid" *ngIf="rows().length">
        <article class="card-surface" *ngFor="let row of rows()">
          <strong>{{ row.employeeName }}</strong>
          <p>{{ row.referenceDate }}</p>
          <ul>
            <li>Horas trabalhadas: {{ row.workedMinutes | minutes }}</li>
            <li>Horas extras: {{ row.overtimeMinutes | minutes }}</li>
            <li>Horas faltantes: {{ row.missingMinutes | minutes }}</li>
            <li>Status: {{ row.status }}</li>
          </ul>
        </article>
      </section>
    </div>
  `,
  styles: [`.filters, .sheet-grid article { padding: 1rem; } .sheet-grid { display: grid; gap: 1rem; grid-template-columns: repeat(2, 1fr); } ul { margin: 0.75rem 0 0; padding-left: 1rem; } @media (max-width: 900px) { .sheet-grid { grid-template-columns: 1fr; } }`]
})
export class TimesheetsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(TimeSheetService);
  readonly rows = signal<TimeSheet[]>([]);
  readonly form = this.fb.nonNullable.group({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.rows.set([]);
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
    const { startDate, endDate } = this.form.getRawValue();
    this.service.list(companyId, startDate, endDate).subscribe((response) => this.rows.set(response.content));
  }
}
