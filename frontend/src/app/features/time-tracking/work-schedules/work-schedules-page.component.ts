import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { WorkSchedule } from '../../../core/models/time-tracking.models';
import { WorkScheduleService } from '../../../core/services/work-schedule.service';

@Component({
  selector: 'app-work-schedules-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class WorkSchedulesPageComponent {
  private readonly service = inject(WorkScheduleService);
  readonly config: ResourcePageConfig<WorkSchedule> = {
    title: 'Jornadas',
    subtitle: 'Defina as regras padrão de horas, tolerância e intervalo.',
    eyebrow: 'Gestão de Ponto',
    emptyTitle: 'Nenhuma jornada cadastrada',
    createLabel: 'Nova jornada',
    service: this.service,
    initialValue: () => ({ id: null, name: '', expectedDailyMinutes: 480, toleranceMinutes: 10, lunchBreakMinutes: 120, active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'daily', label: 'Minutos diários', cell: (row) => String(row.expectedDailyMinutes) },
      { key: 'tolerance', label: 'Tolerância', cell: (row) => String(row.toleranceMinutes) },
      { key: 'lunch', label: 'Almoço', cell: (row) => String(row.lunchBreakMinutes) }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'expectedDailyMinutes', label: 'Minutos diários esperados', type: 'number', required: true },
      { key: 'toleranceMinutes', label: 'Tolerância', type: 'number', required: true },
      { key: 'lunchBreakMinutes', label: 'Intervalo de almoço', type: 'number', required: true }
    ]
  };
}
