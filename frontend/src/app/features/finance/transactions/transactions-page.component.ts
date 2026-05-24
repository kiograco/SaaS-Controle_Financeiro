import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { FinancialTransaction } from '../../../core/models/finance.models';
import { TransactionService } from '../../../core/services/transaction.service';
import { positiveMoneyValidator } from '../../../shared/validators/br-validators';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class TransactionsPageComponent {
  private readonly service = inject(TransactionService);
  readonly config: ResourcePageConfig<FinancialTransaction> = {
    title: 'Transações Financeiras',
    subtitle: 'Registre entradas, saídas e transferências.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma transação cadastrada',
    createLabel: 'Nova transação',
    service: this.service,
    initialValue: () => ({ id: null, categoryId: null, costCenterId: null, bankAccountId: '', payableId: null, receivableId: null, description: '', transactionDate: '', type: 'EXPENSE', amount: 0, notes: '' }),
    getId: (item) => item.id,
    columns: [
      { key: 'description', label: 'Descrição', cell: (row) => row.description },
      { key: 'type', label: 'Tipo', cell: (row) => row.type },
      { key: 'transactionDate', label: 'Data', cell: (row) => row.transactionDate },
      { key: 'amount', label: 'Valor', cell: (row) => String(row.amount) }
    ],
    fields: [
      { key: 'description', label: 'Descrição', type: 'text', required: true },
      { key: 'bankAccountId', label: 'Conta bancária', type: 'text', required: true },
      { key: 'transactionDate', label: 'Data', type: 'date', required: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: [
        { label: 'Receita', value: 'INCOME' }, { label: 'Despesa', value: 'EXPENSE' }, { label: 'Transferência', value: 'TRANSFER' }
      ] },
      { key: 'amount', label: 'Valor', type: 'money', required: true, validators: [positiveMoneyValidator()] },
      { key: 'notes', label: 'Observações', type: 'textarea' }
    ]
  };
}
