import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { CostCenter } from '../../../core/models/finance.models';
import { CostCenterService } from '../../../core/services/cost-center.service';

@Component({
  selector: 'app-cost-centers-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class CostCentersPageComponent {
  private readonly service = inject(CostCenterService);
  readonly config: ResourcePageConfig<CostCenter> = {
    title: 'Centros de Custo',
    subtitle: 'Acompanhe gastos por projeto, unidade ou área.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhum centro de custo cadastrado',
    createLabel: 'Novo centro de custo',
    service: this.service,
    initialValue: () => ({ id: null, name: '', code: '', active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'code', label: 'Código', cell: (row) => row.code },
      { key: 'active', label: 'Status', cell: (row) => row.active ? 'Ativo' : 'Inativo' }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'code', label: 'Código', type: 'text', required: true }
    ]
  };
}
