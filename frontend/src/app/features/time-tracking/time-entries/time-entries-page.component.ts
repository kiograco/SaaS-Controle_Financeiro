import { Component, effect, inject, signal } from '@angular/core';
import { ResourceFieldOption, ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, TimeEntry } from '../../../core/models/time-tracking.models';
import { TimeEntryService } from '../../../core/services/time-entry.service';

function getTimeEntryTypeLabel(type: TimeEntry['type']): string {
  switch (type) {
    case 'CLOCK_IN':
      return 'Entrada';
    case 'LUNCH_START':
      return 'Início do Almoço';
    case 'LUNCH_END':
      return 'Fim do Almoço';
    case 'CLOCK_OUT':
      return 'Saída';
    case 'MANUAL_ADJUSTMENT':
      return 'Ajuste Manual';
    default:
      return type;
  }
}

@Component({
  selector: 'app-time-entries-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class TimeEntriesPageComponent {
  private readonly companyContext = inject(CompanyContextService);
  private readonly employeeService = inject(EmployeeService);
  private readonly service = inject(TimeEntryService);
  readonly employeeOptions = signal<ResourceFieldOption[]>([]);

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.employeeOptions.set([]);
        return;
      }

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
    }, { allowSignalWrites: true });
  }

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
      { key: 'type', label: 'Tipo', cell: (row) => getTimeEntryTypeLabel(row.type) }
    ],
    fields: [
      { key: 'employeeId', label: 'Funcionário', type: 'select', required: true, searchable: true, options: () => this.employeeOptions() },
      { key: 'entryDate', label: 'Data', type: 'date', required: true },
      { key: 'entryTime', label: 'Hora', type: 'time', required: true },
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
