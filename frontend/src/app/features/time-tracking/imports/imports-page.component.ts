import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { TimeImportService } from '../../../core/services/time-import.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeImportBatch, TimeImportError, TimeImportPreviewResponse } from '../../../core/models/time-tracking.models';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-imports-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Importação CSV" subtitle="Faça o upload, valide o preview e confirme a carga de ponto." eyebrow="Gestão de Ponto" />
      <section class="card-surface upload-card">
        <h3>Layout aceito</h3>
        <pre>cpf;data;hora;tipo;nome;matricula;departamento;observacao</pre>
        <p class="helper-text">Tipos aceitos no CSV: Entrada, Saída Almoço, Retorno Almoço e Saída.</p>
        <form [formGroup]="form" class="upload-form">
          <input type="file" accept=".csv" (change)="onFileSelected($event)">
          <label><input type="checkbox" formControlName="createMissingEmployees"> Criar funcionários ausentes durante a importação</label>
          <div class="actions">
            <button mat-stroked-button type="button" (click)="preview()">Gerar preview</button>
            <button mat-flat-button color="primary" type="button" (click)="confirm()">Confirmar importação</button>
          </div>
        </form>
      </section>

      <section class="card-surface" *ngIf="previewState() as preview">
        <h3>Resultado do preview</h3>
        <p>{{ preview.validRows }} linhas válidas e {{ preview.errorRows }} linhas inválidas.</p>
        <p *ngIf="previewPeriodLabel() as period">Período identificado no arquivo: {{ period }}</p>
        <div class="actions" *ngIf="previewPeriodRange() as periodRange">
          <button mat-stroked-button type="button" (click)="openTimesheetPeriod(periodRange.startDate, periodRange.endDate)">Abrir espelho do período</button>
          <button mat-stroked-button type="button" (click)="openReportMonth(periodRange.startDate)">Abrir relatório do mês</button>
        </div>
        <div class="preview-grid">
          <article *ngFor="let row of preview.rows" [class.invalid]="!row.valido">
            <strong>Linha {{ row.rowNumber }}</strong>
            <p>{{ row.cpf }} - {{ row.tipo }}</p>
            <small>{{ row.mensagem }}</small>
          </article>
        </div>
      </section>

      <section class="card-surface" *ngIf="batches().length">
        <h3>Histórico de importações</h3>
        <div class="batch-list">
          <article *ngFor="let batch of batches()" (click)="loadErrors(batch.id)">
            <strong>{{ batch.fileName }}</strong>
            <p>{{ batch.status }} • {{ batch.successRows }}/{{ batch.totalRows }} linhas</p>
            <div class="batch-actions">
              <button mat-stroked-button type="button" (click)="deleteBatch(batch.id, $event)">Excluir CSV importado</button>
            </div>
          </article>
        </div>
      </section>

      <section class="card-surface" *ngIf="selectedErrors().length">
        <h3>Erros por linha</h3>
        <ul>
          <li *ngFor="let error of selectedErrors()">Linha {{ error.rowNumber }}: {{ error.errorMessage }}</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .upload-card, section.card-surface { padding: 1.2rem; }
    .upload-form { display: grid; gap: 1rem; }
    pre { background: var(--surface-alt); padding: 1rem; border-radius: 16px; overflow: auto; }
    .helper-text { color: var(--text-muted); margin: 0 0 1rem; }
    .actions { display: flex; gap: 0.8rem; flex-wrap: wrap; }
    .preview-grid, .batch-list { display: grid; gap: 0.8rem; }
    article { padding: 0.9rem; border: 1px solid var(--border); border-radius: 16px; }
    article.invalid { border-color: var(--danger); }
    .batch-actions { display: flex; justify-content: flex-end; margin-top: 0.8rem; }
  `]
})
export class ImportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyContext = inject(CompanyContextService);
  private readonly router = inject(Router);
  private readonly service = inject(TimeImportService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    createMissingEmployees: false
  });
  readonly previewState = signal<TimeImportPreviewResponse | null>(null);
  readonly batches = signal<TimeImportBatch[]>([]);
  readonly selectedErrors = signal<TimeImportError[]>([]);
  readonly previewPeriodRange = computed(() => {
    const rows = this.previewState()?.rows
      .map((row) => row.data)
      .filter((value): value is string => Boolean(value))
      .sort();
    if (!rows?.length) {
      return null;
    }
    return {
      startDate: rows[0],
      endDate: rows[rows.length - 1]
    };
  });
  readonly previewPeriodLabel = computed(() => {
    const period = this.previewPeriodRange();
    if (!period) {
      return null;
    }
    return period.startDate === period.endDate ? period.startDate : `${period.startDate} até ${period.endDate}`;
  });
  private file: File | null = null;
  private readonly maxFileSize = 2 * 1024 * 1024;

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      this.previewState.set(null);
      this.selectedErrors.set([]);
      if (!companyId) {
        this.batches.set([]);
        return;
      }
      this.loadBatches();
    }, { allowSignalWrites: true });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.file = null;
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.file = null;
      input.value = '';
      this.toast.error('Arquivo inválido', 'Selecione um arquivo CSV válido.');
      return;
    }
    if (file.size > this.maxFileSize) {
      this.file = null;
      input.value = '';
      this.toast.error('Arquivo muito grande', 'O CSV deve ter no máximo 2 MB.');
      return;
    }
    this.file = file;
  }

  preview(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId || !this.file) {
      this.toast.error('Arquivo obrigatório', 'Selecione um CSV antes de gerar o preview.');
      return;
    }
    this.service.preview(companyId, this.file, this.form.getRawValue().createMissingEmployees).subscribe((response) => {
      this.previewState.set(response);
    });
  }

  confirm(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId || !this.file) {
      return;
    }
    this.service.confirm(companyId, this.file, this.form.getRawValue().createMissingEmployees).subscribe(() => {
      this.toast.success('Importação concluída', 'O lote foi processado com sucesso.');
      this.loadBatches();
    });
  }

  loadBatches(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      return;
    }
    this.service.list(companyId).subscribe((response) => this.batches.set(response.content));
  }

  loadErrors(batchId: string): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      return;
    }
    this.service.errors(companyId, batchId).subscribe((errors) => this.selectedErrors.set(errors));
  }

  deleteBatch(batchId: string, event: Event): void {
    event.stopPropagation();
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      return;
    }

    this.service.delete(companyId, batchId).subscribe(() => {
      this.toast.success('Importação excluída', 'O lote importado e suas marcações foram removidos.');
      this.selectedErrors.set([]);
      this.loadBatches();
    });
  }

  openTimesheetPeriod(startDate: string, endDate: string): void {
    this.router.navigate(['/time-tracking/timesheets'], {
      queryParams: { startDate, endDate }
    });
  }

  openReportMonth(referenceDate: string): void {
    this.router.navigate(['/time-tracking/reports'], {
      queryParams: { month: referenceDate.slice(0, 7) }
    });
  }
}
