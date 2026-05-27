import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ResourcePageComponent
  ],
  template: `
    <app-resource-page [config]="config" (saved)="refreshAssignmentOptions()" (removed)="refreshAssignmentOptions()" />

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
          <input
            matInput
            type="text"
            [formControl]="employeeSearchControl"
            [matAutocomplete]="employeeAuto"
            placeholder="Selecione um funcionário cadastrado">
          <mat-autocomplete #employeeAuto="matAutocomplete" (optionSelected)="selectEmployee($event.option.value)">
            <mat-option *ngFor="let option of filteredEmployeeOptions()" [value]="option.label">{{ option.label }}</mat-option>
          </mat-autocomplete>
          <mat-hint *ngIf="!employeeOptions().length">Cadastre funcionários no sistema para vinculá-los a uma jornada.</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Jornada</mat-label>
          <input
            matInput
            type="text"
            [formControl]="scheduleSearchControl"
            [matAutocomplete]="scheduleAuto"
            placeholder="Digite o nome da jornada cadastrada">
          <mat-autocomplete #scheduleAuto="matAutocomplete" (optionSelected)="selectSchedule($event.option.value)">
            <mat-option *ngFor="let option of filteredScheduleOptions()" [value]="option.label">{{ option.label }}</mat-option>
          </mat-autocomplete>
          <mat-hint *ngIf="!scheduleOptions().length">Cadastre uma jornada para vinculá-la ao funcionário.</mat-hint>
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
  readonly employeeSearchControl = new FormControl('', { nonNullable: true });
  readonly scheduleSearchControl = new FormControl('', { nonNullable: true });
  readonly workingDayOptions: ResourceFieldOption[] = [
    { value: 'MONDAY', label: 'Segunda-feira' },
    { value: 'TUESDAY', label: 'Terca-feira' },
    { value: 'WEDNESDAY', label: 'Quarta-feira' },
    { value: 'THURSDAY', label: 'Quinta-feira' },
    { value: 'FRIDAY', label: 'Sexta-feira' },
    { value: 'SATURDAY', label: 'Sabado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  readonly assignmentForm = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    workScheduleId: ['', Validators.required],
    startDate: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  constructor() {
    this.employeeSearchControl.valueChanges.subscribe((value) => {
      if (!value) {
        this.assignmentForm.patchValue({ employeeId: '' }, { emitEvent: false });
        return;
      }

      const selectedOption = this.employeeOptions().find((option) => option.label === value);
      if (selectedOption) {
        this.assignmentForm.patchValue({ employeeId: selectedOption.value }, { emitEvent: false });
      } else {
        this.assignmentForm.patchValue({ employeeId: '' }, { emitEvent: false });
      }
    });

    this.scheduleSearchControl.valueChanges.subscribe((value) => {
      if (!value) {
        this.assignmentForm.patchValue({ workScheduleId: '' }, { emitEvent: false });
        return;
      }

      const selectedOption = this.scheduleOptions().find((option) => option.label === value);
      if (selectedOption) {
        this.assignmentForm.patchValue({ workScheduleId: selectedOption.value }, { emitEvent: false });
      } else {
        this.assignmentForm.patchValue({ workScheduleId: '' }, { emitEvent: false });
      }
    });

    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.employeeOptions.set([]);
        this.scheduleOptions.set([]);
        this.employeeSearchControl.setValue('', { emitEvent: false });
        this.scheduleSearchControl.setValue('', { emitEvent: false });
        this.assignmentForm.patchValue({ employeeId: '', workScheduleId: '' }, { emitEvent: false });
        return;
      }

      this.loadEmployeeOptions(companyId);
      this.loadScheduleOptions(companyId);
    }, { allowSignalWrites: true });
  }

  readonly config: ResourcePageConfig<WorkSchedule> = {
    title: 'Jornadas',
    subtitle: 'Defina as regras padrão de horas, tolerância e intervalo.',
    eyebrow: 'Gestão de Ponto',
    emptyTitle: 'Nenhuma jornada cadastrada',
    createLabel: 'Nova jornada',
    service: this.service,
    initialValue: () => ({
      id: null,
      name: '',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      expectedDailyMinutes: 480,
      toleranceMinutes: 10,
      lunchBreakMinutes: 120,
      startTime: '08:00',
      endTime: '18:00',
      active: true
    }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'workingDays', label: 'Dias', cell: (row) => row.workingDays.map((day) => this.workingDayLabel(day)).join(', ') },
      { key: 'hours', label: 'Expediente', cell: (row) => `${row.startTime} às ${row.endTime}` },
      { key: 'daily', label: 'Minutos diários', cell: (row) => String(row.expectedDailyMinutes) },
      { key: 'tolerance', label: 'Tolerância', cell: (row) => String(row.toleranceMinutes) },
      { key: 'lunch', label: 'Descanso', cell: (row) => String(row.lunchBreakMinutes) }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'workingDays', label: 'Dias da semana', type: 'select', multiple: true, required: true, options: this.workingDayOptions },
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
        this.employeeSearchControl.setValue('', { emitEvent: false });
        this.scheduleSearchControl.setValue('', { emitEvent: false });
        this.loadScheduleOptions(companyId);
      }
    });
  }

  refreshAssignmentOptions(): void {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) {
      return;
    }

    this.loadEmployeeOptions(companyId);
    this.loadScheduleOptions(companyId);
  }

  filteredEmployeeOptions(): ResourceFieldOption[] {
    const query = this.employeeSearchControl.value.toLowerCase().trim();
    if (!query) {
      return this.employeeOptions();
    }

    return this.employeeOptions().filter((option) => option.label.toLowerCase().includes(query));
  }

  selectEmployee(label: string): void {
    const employee = this.employeeOptions().find((option) => option.label === label);
    if (!employee) {
      return;
    }

    this.assignmentForm.patchValue({ employeeId: employee.value }, { emitEvent: false });
    this.employeeSearchControl.setValue(employee.label, { emitEvent: false });
  }

  filteredScheduleOptions(): ResourceFieldOption[] {
    const query = this.scheduleSearchControl.value.toLowerCase().trim();
    if (!query) {
      return this.scheduleOptions();
    }

    return this.scheduleOptions().filter((option) => option.label.toLowerCase().includes(query));
  }

  selectSchedule(label: string): void {
    const schedule = this.scheduleOptions().find((option) => option.label === label);
    if (!schedule) {
      return;
    }

    this.assignmentForm.patchValue({ workScheduleId: schedule.value }, { emitEvent: false });
    this.scheduleSearchControl.setValue(schedule.label, { emitEvent: false });
  }

  private workingDayLabel(day: string): string {
    return this.workingDayOptions.find((option) => option.value === day)?.label ?? day;
  }

  private loadEmployeeOptions(companyId: string): void {
    this.employeeService.list(companyId, { page: 0, size: 200 }).subscribe({
      next: (response) => {
        const options = response.content
          .filter((employee: Employee) => Boolean(employee.id))
          .map((employee: Employee) => ({
            value: employee.id ?? '',
            label: employee.name
          }));

        this.employeeOptions.set(options);
        const selectedEmployeeId = this.assignmentForm.getRawValue().employeeId;
        const selectedEmployee = options.find((option) => option.value === selectedEmployeeId);
        this.employeeSearchControl.setValue(selectedEmployee?.label ?? '', { emitEvent: false });
      },
      error: () => {
        this.employeeOptions.set([]);
        this.employeeSearchControl.setValue('', { emitEvent: false });
        this.assignmentForm.patchValue({ employeeId: '' }, { emitEvent: false });
      }
    });
  }

  private loadScheduleOptions(companyId: string): void {
    this.service.list(companyId, { page: 0, size: 100 }).subscribe({
      next: (response) => {
        const options = response.content
          .filter((schedule: WorkSchedule) => Boolean(schedule.id))
          .map((schedule: WorkSchedule) => ({
            value: schedule.id ?? '',
            label: `${schedule.name} • ${schedule.startTime} às ${schedule.endTime} • ${schedule.expectedDailyMinutes} min • tolerância ${schedule.toleranceMinutes} min`
          }));

        this.scheduleOptions.set(options);
        const selectedScheduleId = this.assignmentForm.getRawValue().workScheduleId;
        const selectedSchedule = options.find((option) => option.value === selectedScheduleId);
        this.scheduleSearchControl.setValue(selectedSchedule?.label ?? '', { emitEvent: false });
      },
      error: () => {
        this.scheduleOptions.set([]);
        this.scheduleSearchControl.setValue('', { emitEvent: false });
        this.assignmentForm.patchValue({ workScheduleId: '' }, { emitEvent: false });
      }
    });
  }
}
