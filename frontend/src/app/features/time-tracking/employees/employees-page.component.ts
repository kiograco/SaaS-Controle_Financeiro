import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { Employee } from '../../../core/models/time-tracking.models';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class EmployeesPageComponent {
  private readonly service = inject(EmployeeService);
  readonly config: ResourcePageConfig<Employee> = {
    title: 'Funcionários',
    subtitle: 'Cadastre colaboradores, departamentos e dados básicos de jornada.',
    eyebrow: 'Gestão de Ponto',
    emptyTitle: 'Nenhum funcionário cadastrado',
    createLabel: 'Novo funcionário',
    service: this.service,
    initialValue: () => ({ id: null, name: '', cpf: '', email: '', registrationNumber: '', department: '', position: '', active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'cpf', label: 'CPF', cell: (row) => row.cpf },
      { key: 'department', label: 'Departamento', cell: (row) => row.department },
      { key: 'position', label: 'Cargo', cell: (row) => row.position }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'cpf', label: 'CPF', type: 'text', required: true },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'registrationNumber', label: 'Matrícula', type: 'text' },
      { key: 'department', label: 'Departamento', type: 'text' },
      { key: 'position', label: 'Cargo', type: 'text' }
    ]
  };
}
