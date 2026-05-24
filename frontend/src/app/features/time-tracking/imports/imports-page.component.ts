import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    .actions { display: flex; gap: 0.8rem; flex-wrap: wrap; }
    .preview-grid, .batch-list { display: grid; gap: 0.8rem; }
    article { padding: 0.9rem; border: 1px solid var(--border); border-radius: 16px; }
    article.invalid { border-color: var(--danger); }
  `]
})
export class ImportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(TimeImportService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    createMissingEmployees: false
  });
  readonly previewState = signal<TimeImportPreviewResponse | null>(null);
  readonly batches = signal<TimeImportBatch[]>([]);
  readonly selectedErrors = signal<TimeImportError[]>([]);
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
      this.previewState.set(null);
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
}
