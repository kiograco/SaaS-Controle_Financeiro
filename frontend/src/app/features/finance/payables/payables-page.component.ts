import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { Payable } from '../../../core/models/finance.models';
import { PayableService } from '../../../core/services/payable.service';
import { positiveMoneyValidator } from '../../../shared/validators/br-validators';

@Component({
  selector: 'app-payables-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class PayablesPageComponent {
  private readonly service = inject(PayableService);
  readonly config: ResourcePageConfig<Payable> = {
    title: 'Contas a Pagar',
    subtitle: 'Registre vencimentos, pagamentos e fornecedores.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma conta a pagar cadastrada',
    createLabel: 'Nova conta a pagar',
    service: this.service,
    initialValue: () => ({ id: null, categoryId: null, costCenterId: null, bankAccountId: null, description: '', supplierName: '', dueDate: '', amount: 0, paidAmount: 0, status: 'OPEN', notes: '' }),
    getId: (item) => item.id,
    columns: [
      { key: 'description', label: 'Descrição', cell: (row) => row.description },
      { key: 'supplier', label: 'Fornecedor', cell: (row) => row.supplierName },
      { key: 'dueDate', label: 'Vencimento', cell: (row) => row.dueDate },
      { key: 'status', label: 'Status', cell: (row) => row.status }
    ],
    fields: [
      { key: 'description', label: 'Descrição', type: 'text', required: true },
      { key: 'supplierName', label: 'Fornecedor', type: 'text', required: true },
      { key: 'dueDate', label: 'Vencimento', type: 'date', required: true },
      { key: 'amount', label: 'Valor', type: 'money', required: true, validators: [positiveMoneyValidator()] },
      { key: 'paidAmount', label: 'Valor pago', type: 'money', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aberta', value: 'OPEN' }, { label: 'Parcialmente paga', value: 'PARTIALLY_PAID' },
        { label: 'Paga', value: 'PAID' }, { label: 'Vencida', value: 'OVERDUE' }, { label: 'Cancelada', value: 'CANCELLED' }
      ] },
      { key: 'notes', label: 'Observações', type: 'textarea' }
    ]
  };
}
