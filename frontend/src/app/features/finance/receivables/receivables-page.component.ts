import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { Receivable } from '../../../core/models/finance.models';
import { ReceivableService } from '../../../core/services/receivable.service';
import { positiveMoneyValidator } from '../../../shared/validators/br-validators';

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class ReceivablesPageComponent {
  private readonly service = inject(ReceivableService);
  readonly config: ResourcePageConfig<Receivable> = {
    title: 'Contas a Receber',
    subtitle: 'Controle títulos de clientes, recebimentos e pendências.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma conta a receber cadastrada',
    createLabel: 'Nova conta a receber',
    service: this.service,
    initialValue: () => ({ id: null, categoryId: null, costCenterId: null, bankAccountId: null, description: '', customerName: '', dueDate: '', amount: 0, receivedAmount: 0, status: 'OPEN', notes: '' }),
    getId: (item) => item.id,
    columns: [
      { key: 'description', label: 'Descrição', cell: (row) => row.description },
      { key: 'customerName', label: 'Cliente', cell: (row) => row.customerName },
      { key: 'dueDate', label: 'Vencimento', cell: (row) => row.dueDate },
      { key: 'status', label: 'Status', cell: (row) => row.status }
    ],
    fields: [
      { key: 'description', label: 'Descrição', type: 'text', required: true },
      { key: 'customerName', label: 'Cliente', type: 'text', required: true },
      { key: 'dueDate', label: 'Vencimento', type: 'date', required: true },
      { key: 'amount', label: 'Valor', type: 'money', required: true, validators: [positiveMoneyValidator()] },
      { key: 'receivedAmount', label: 'Valor recebido', type: 'money', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aberta', value: 'OPEN' }, { label: 'Parcialmente recebida', value: 'PARTIALLY_PAID' },
        { label: 'Recebida', value: 'PAID' }, { label: 'Vencida', value: 'OVERDUE' }, { label: 'Cancelada', value: 'CANCELLED' }
      ] },
      { key: 'notes', label: 'Observações', type: 'textarea' }
    ]
  };
}
