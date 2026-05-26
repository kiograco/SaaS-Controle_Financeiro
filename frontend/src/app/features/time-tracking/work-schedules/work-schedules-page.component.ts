import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { WorkScheduleService } from '../../../core/services/work-schedule.service';
import { Employee, WorkSchedule } from '../../../core/models/time-tracking.models';
import { ToastService } from '../../../core/services/toast.service';
import { ResourceFieldOption, ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';

@Component({
  selector: 'app-work-schedules-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ResourcePageComponent
  ],
  template: `
    <app-resource-page [config]="config" />

    <section class="card-surface assignment-card">
      <header>
        <div>
          <h3>Vincular jornada ao funcionário</h3>
          <p>Selecione o funcionário pelo nome e aplique a jornada com carga horária e tolerância desejadas.</p>
        </div>
      </header>

      <form class="assignment-form" [formGroup]="assignmentForm">
        <mat-form-field appearance="outline">
          <mat-label>Funcionário</mat-label>
          <mat-select formControlName="employeeId">
            <mat-option *ngFor="let option of employeeOptions()" [value]="option.value">{{ option.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Jornada</mat-label>
          <mat-select formControlName="workScheduleId">
            <mat-option *ngFor="let option of scheduleOptions()" [value]="option.value">{{ option.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data de início</mat-label>
          <input matInput type="date" formControlName="startDate">
        </mat-form-field>

        <div class="assignment-actions">
          <button mat-flat-button color="primary" type="button" (click)="assignSchedule()" [disabled]="assignmentForm.invalid">
            Salvar vínculo
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .assignment-card {
      padding: 1rem;
      margin-top: 1rem;
    }
    .assignment-card header p {
      margin: 0.35rem 0 0;
      color: var(--text-soft);
    }
    .assignment-form {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .assignment-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
    }
    @media (max-width: 900px) {
      .assignment-form {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkSchedulesPageComponent {
  private readonly companyContext = inject(CompanyContextService);
  private readonly employeeService = inject(EmployeeService);
  private readonly service = inject(WorkScheduleService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly employeeOptions = signal<ResourceFieldOption[]>([]);
  readonly scheduleOptions = signal<ResourceFieldOption[]>([]);

  readonly assignmentForm = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    workScheduleId: ['', Validators.required],
    startDate: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.employeeOptions.set([]);
        this.scheduleOptions.set([]);
        return;
      }

      this.loadEmployeeOptions(companyId);
      this.loadScheduleOptions(companyId);
    });
  }

  readonly config: ResourcePageConfig<WorkSchedule> = {
    title: 'Jornadas',
    subtitle: 'Defina as regras padrão de horas, tolerância e intervalo.',
    eyebrow: 'Gestão de Ponto',
    emptyTitle: 'Nenhuma jornada cadastrada',
    createLabel: 'Nova jornada',
    service: this.service,
    initialValue: () => ({ id: null, name: '', expectedDailyMinutes: 480, toleranceMinutes: 10, lunchBreakMinutes: 120, startTime: '08:00', endTime: '18:00', active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'hours', label: 'Expediente', cell: (row) => `${row.startTime} às ${row.endTime}` },
      { key: 'daily', label: 'Minutos diários', cell: (row) => String(row.expectedDailyMinutes) },
      { key: 'tolerance', label: 'Tolerância', cell: (row) => String(row.toleranceMinutes) },
      { key: 'lunch', label: 'Descanso', cell: (row) => String(row.lunchBreakMinutes) }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'startTime', label: 'Horário de entrada', type: 'time', required: true },
      { key: 'endTime', label: 'Horário de saída', type: 'time', required: true },
      { key: 'expectedDailyMinutes', label: 'Minutos diários esperados', type: 'number', required: true },
      { key: 'toleranceMinutes', label: 'Tolerância', type: 'number', required: true },
      { key: 'lunchBreakMinutes', label: 'Minutos de descanso', type: 'number', required: true }
    ]
  };

  assignSchedule(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId || this.assignmentForm.invalid) {
      return;
    }

    const { employeeId, workScheduleId, startDate } = this.assignmentForm.getRawValue();
    this.service.assign(companyId, { employeeId, workScheduleId, startDate }).subscribe({
      next: () => {
        this.toast.success('Jornada vinculada', 'A jornada foi associada ao funcionário com sucesso.');
        this.assignmentForm.patchValue({
          employeeId: '',
          workScheduleId: '',
          startDate: new Date().toISOString().slice(0, 10)
        });
        this.loadScheduleOptions(companyId);
      }
    });
  }

  private loadEmployeeOptions(companyId: string): void {
    this.employeeService.list(companyId, { page: 0, size: 200 }).subscribe({
      next: (response) => {
        this.employeeOptions.set(
          response.content
            .filter((employee: Employee) => Boolean(employee.id))
            .map((employee: Employee) => ({
              value: employee.id ?? '',
              label: employee.name
            }))
        );
      },
      error: () => this.employeeOptions.set([])
    });
  }

  private loadScheduleOptions(companyId: string): void {
    this.service.list(companyId, { page: 0, size: 100 }).subscribe({
      next: (response) => {
        this.scheduleOptions.set(
          response.content
            .filter((schedule: WorkSchedule) => Boolean(schedule.id))
            .map((schedule: WorkSchedule) => ({
              value: schedule.id ?? '',
              label: `${schedule.name} • ${schedule.startTime} às ${schedule.endTime} • ${schedule.expectedDailyMinutes} min • tolerância ${schedule.toleranceMinutes} min`
            }))
        );
      },
      error: () => this.scheduleOptions.set([])
    });
  }
}
