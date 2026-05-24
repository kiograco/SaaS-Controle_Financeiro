import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CompanyContextService } from '../../core/services/company-context.service';
import { ToastService } from '../../core/services/toast.service';
import { DataColumn, DataTableComponent } from './data-table.component';
import { EmptyStateComponent } from './empty-state.component';
import { PageHeaderComponent } from './page-header.component';
import { MoneyInputDirective } from '../directives/money-input.directive';

export interface ResourceFieldOption {
  label: string;
  value: string;
}

export interface ResourceField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'money' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: ResourceFieldOption[] | (() => ResourceFieldOption[]);
  validators?: ValidatorFn[];
  inputMode?: 'text' | 'numeric' | 'decimal';
  maxLength?: number;
  transformInput?: (value: string, formValue: Record<string, unknown>) => string;
  searchable?: boolean;
}

export interface ResourcePageConfig<T> {
  title: string;
  subtitle: string;
  eyebrow: string;
  emptyTitle: string;
  createLabel: string;
  columns: DataColumn<T>[];
  fields: ResourceField[];
  service: {
    list(companyId: string, params?: Record<string, string | number | boolean | null | undefined>): import('rxjs').Observable<{ content: T[] }>;
    create(companyId: string, payload: T): import('rxjs').Observable<T>;
    update(companyId: string, id: string, payload: T): import('rxjs').Observable<T>;
    remove(companyId: string, id: string): import('rxjs').Observable<void>;
  };
  initialValue: () => T;
  getId: (item: T) => string | null;
}

@Component({
  selector: 'app-resource-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent,
    MoneyInputDirective
  ],
  template: `
    <div class="page-shell">
      <app-page-header [title]="config.title" [subtitle]="config.subtitle" [eyebrow]="config.eyebrow">
        <button mat-flat-button color="primary" type="button" (click)="startCreate()">{{ config.createLabel }}</button>
      </app-page-header>

      <section class="card-surface filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Pesquisar</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Digite um termo para filtrar">
        </mat-form-field>
      </section>

      <section class="card-surface editor" *ngIf="editing()">
        <header>
          <h3>{{ editingId() ? 'Editar registro' : config.createLabel }}</h3>
          <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
        </header>
        <form class="form-grid" [formGroup]="form" (ngSubmit)="save()">
          <ng-container *ngFor="let field of config.fields">
            <mat-form-field appearance="outline" class="form-col-6" *ngIf="field.type === 'money'">
              <mat-label>{{ field.label }}</mat-label>
              <span matTextPrefix>R$&nbsp;</span>
              <input matInput type="text" [formControlName]="field.key" appMoneyInput>
            </mat-form-field>
            <mat-form-field appearance="outline" class="form-col-6" *ngIf="field.type !== 'textarea' && field.type !== 'select' && field.type !== 'money'">
              <mat-label>{{ field.label }}</mat-label>
              <input
                matInput
                [type]="field.type"
                [formControlName]="field.key"
                [attr.inputmode]="field.inputMode ?? null"
                [attr.maxlength]="field.maxLength ?? null"
                (input)="handleTextInput(field, $event)">
            </mat-form-field>
            <mat-form-field appearance="outline" class="form-col-6" *ngIf="field.type === 'select' && !field.searchable">
              <mat-label>{{ field.label }}</mat-label>
              <mat-select [formControlName]="field.key">
                <mat-option *ngFor="let option of getFieldOptions(field)" [value]="option.value">{{ option.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="form-col-6" *ngIf="field.type === 'select' && field.searchable">
              <mat-label>{{ field.label }}</mat-label>
              <input
                matInput
                type="text"
                [formControl]="getSearchControl(field)"
                [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectSearchableOption(field, $event.option.value)">
                <mat-option *ngFor="let option of getFilteredFieldOptions(field)" [value]="option.label">{{ option.label }}</mat-option>
              </mat-autocomplete>
            </mat-form-field>
            <mat-form-field appearance="outline" class="form-col-12" *ngIf="field.type === 'textarea'">
              <mat-label>{{ field.label }}</mat-label>
              <textarea matInput rows="4" [formControlName]="field.key"></textarea>
            </mat-form-field>
          </ng-container>
          <div class="form-col-12 actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </section>

      <app-empty-state *ngIf="!rows().length" [title]="config.emptyTitle" [description]="'Cadastre novos itens para começar.'" />
      <app-data-table *ngIf="rows().length" [columns]="config.columns" [rows]="rows()" (edit)="startEdit($event)" (remove)="remove($event)" />
    </div>
  `,
  styles: [`
    .filter-bar, .editor { padding: 1rem; }
    .search-field { width: min(420px, 100%); }
    .editor header {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem;
    }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class ResourcePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);

  @Input({ required: true }) config!: ResourcePageConfig<any>;

  readonly rows = signal<any[]>([]);
  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly searchableControls: Record<string, FormControl<string>> = {};

  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.form = this.fb.group(
      Object.fromEntries(this.config.fields.map((field) => {
        const validators: ValidatorFn[] = [];
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.validators) {
          validators.push(...field.validators);
        }
        return [field.key, this.fb.control('', validators)];
      }))
    );
    this.initializeSearchableControls();
    this.searchControl.valueChanges.subscribe(() => this.load());
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      this.editing.set(false);
      this.editingId.set(null);
      if (!companyId) {
        this.rows.set([]);
        return;
      }
      this.load();
    }, { injector: this.injector, allowSignalWrites: true });
    this.load();
  }

  load(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      this.rows.set([]);
      return;
    }
    this.config.service.list(companyId, { search: this.searchControl.value, page: 0, size: 50 }).subscribe({
      next: (response) => this.rows.set(response.content)
    });
  }

  startCreate(): void {
    this.form.reset(this.config.initialValue() as Record<string, unknown>);
    this.syncSearchableControlsFromForm();
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(item: any): void {
    this.form.reset(item as Record<string, unknown>);
    this.syncSearchableControlsFromForm();
    this.editingId.set(this.config.getId(item));
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.editingId.set(null);
  }

  save(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      this.toast.error('Empresa não selecionada', 'Selecione uma empresa antes de salvar.');
      return;
    }
    const payload = this.form.getRawValue();
    const request$ = this.editingId()
      ? this.config.service.update(companyId, this.editingId() ?? '', payload)
      : this.config.service.create(companyId, payload);
    request$.subscribe({
      next: () => {
        this.toast.success('Operação concluída', 'Os dados foram salvos com sucesso.');
        this.cancel();
        this.load();
      }
    });
  }

  remove(item: any): void {
    const companyId = this.companyContext.selectedCompanyId();
    const id = this.config.getId(item);
    if (!companyId || !id) {
      return;
    }
    this.config.service.remove(companyId, id).subscribe({
      next: () => {
        this.toast.success('Registro removido', 'O item foi removido com sucesso.');
        this.load();
      }
    });
  }

  getFieldOptions(field: ResourceField): ResourceFieldOption[] {
    if (!field.options) {
      return [];
    }
    return typeof field.options === 'function' ? field.options() : field.options;
  }

  getSearchControl(field: ResourceField): FormControl<string> {
    return this.searchableControls[field.key];
  }

  getFilteredFieldOptions(field: ResourceField): ResourceFieldOption[] {
    const query = this.getSearchControl(field)?.value?.toLowerCase().trim() ?? '';
    const options = this.getFieldOptions(field);
    if (!query) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(query));
  }

  selectSearchableOption(field: ResourceField, label: string): void {
    const option = this.getFieldOptions(field).find((item) => item.label === label);
    if (!option) {
      return;
    }

    this.form.get(field.key)?.setValue(option.value);
    this.getSearchControl(field).setValue(option.label, { emitEvent: false });
  }

  handleTextInput(field: ResourceField, event: Event): void {
    if (!field.transformInput) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const transformedValue = field.transformInput(input.value, this.form.getRawValue());
    if (transformedValue === input.value) {
      return;
    }

    input.value = transformedValue;
    this.form.get(field.key)?.setValue(transformedValue);
  }

  private initializeSearchableControls(): void {
    for (const field of this.config.fields.filter((item) => item.type === 'select' && item.searchable)) {
      const control = new FormControl('', { nonNullable: true });
      control.valueChanges.subscribe((value) => {
        if (!value) {
          this.form.get(field.key)?.setValue(null);
          return;
        }

        const exactMatch = this.getFieldOptions(field).find((option) => option.label === value);
        if (exactMatch) {
          this.form.get(field.key)?.setValue(exactMatch.value);
        }
      });
      this.searchableControls[field.key] = control;
    }
  }

  private syncSearchableControlsFromForm(): void {
    for (const field of this.config.fields.filter((item) => item.type === 'select' && item.searchable)) {
      const value = this.form.get(field.key)?.value;
      const label = this.getFieldOptions(field).find((option) => option.value === value)?.label ?? '';
      this.getSearchControl(field).setValue(label, { emitEvent: false });
    }
  }
}
