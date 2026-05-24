import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { TimeEntry } from '../../../core/models/time-tracking.models';
import { TimeEntryService } from '../../../core/services/time-entry.service';

@Component({
  selector: 'app-time-entries-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class TimeEntriesPageComponent {
  private readonly service = inject(TimeEntryService);
  readonly config: ResourcePageConfig<TimeEntry> = {
    title: 'Registros de Ponto',
    subtitle: 'Cadastre marcações manuais e acompanhe registros do período.',
    eyebrow: 'Gestão de Ponto',
    emptyTitle: 'Nenhum registro encontrado',
    createLabel: 'Novo registro',
    service: this.service,
    initialValue: () => ({ id: null, employeeId: '', entryDate: '', entryTime: '', type: 'CLOCK_IN', source: 'MANUAL', notes: '' }),
    getId: (item) => item.id,
    columns: [
      { key: 'employeeName', label: 'Funcionário', cell: (row) => row.employeeName ?? row.employeeId },
      { key: 'entryDate', label: 'Data', cell: (row) => row.entryDate },
      { key: 'entryTime', label: 'Hora', cell: (row) => row.entryTime },
      { key: 'type', label: 'Tipo', cell: (row) => row.type }
    ],
    fields: [
      { key: 'employeeId', label: 'ID do funcionário', type: 'text', required: true },
      { key: 'entryDate', label: 'Data', type: 'date', required: true },
      { key: 'entryTime', label: 'Hora', type: 'text', required: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: [
        { label: 'Entrada', value: 'CLOCK_IN' },
        { label: 'Início do Almoço', value: 'LUNCH_START' },
        { label: 'Fim do Almoço', value: 'LUNCH_END' },
        { label: 'Saída', value: 'CLOCK_OUT' },
        { label: 'Ajuste Manual', value: 'MANUAL_ADJUSTMENT' }
      ] },
      { key: 'notes', label: 'Observações', type: 'textarea' }
    ]
  };
}
