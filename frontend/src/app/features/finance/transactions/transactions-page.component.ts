import { Component, effect, inject, signal } from '@angular/core';
import { ResourceFieldOption, ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { BankAccount, FinancialTransaction } from '../../../core/models/finance.models';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { BankAccountService } from '../../../core/services/bank-account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { positiveMoneyValidator } from '../../../shared/validators/br-validators';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class TransactionsPageComponent {
  private readonly companyContext = inject(CompanyContextService);
  private readonly bankAccountService = inject(BankAccountService);
  private readonly service = inject(TransactionService);
  readonly bankAccountOptions = signal<ResourceFieldOption[]>([]);

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.bankAccountOptions.set([]);
        return;
      }

      this.bankAccountService.list(companyId, { page: 0, size: 100 }).subscribe({
        next: (response) => {
          this.bankAccountOptions.set(
            response.content
              .filter((account: BankAccount) => Boolean(account.id))
              .map((account: BankAccount) => ({
                value: account.id ?? '',
                label: `${account.name} - ${account.bankName}`
              }))
          );
        },
        error: () => this.bankAccountOptions.set([])
      });
    });
  }

  readonly config: ResourcePageConfig<FinancialTransaction> = {
    title: 'Transações Financeiras',
    subtitle: 'Registre entradas, saídas e transferências.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma transação cadastrada',
    createLabel: 'Nova transação',
    service: this.service,
    initialValue: () => ({ id: null, categoryId: null, costCenterId: null, bankAccountId: null, payableId: null, receivableId: null, description: '', transactionDate: '', type: 'EXPENSE', amount: 0, notes: '' }),
    getId: (item) => item.id,
    columns: [
      { key: 'description', label: 'Descrição', cell: (row) => row.description },
      { key: 'type', label: 'Tipo', cell: (row) => row.type },
      { key: 'transactionDate', label: 'Data', cell: (row) => row.transactionDate },
      { key: 'amount', label: 'Valor', cell: (row) => String(row.amount) }
    ],
    fields: [
      { key: 'description', label: 'Descrição', type: 'text', required: true },
      { key: 'bankAccountId', label: 'Conta bancária', type: 'select', required: true, searchable: true, options: () => this.bankAccountOptions() },
      { key: 'transactionDate', label: 'Data', type: 'date', required: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: [
        { label: 'Receita', value: 'INCOME' }, { label: 'Despesa', value: 'EXPENSE' }, { label: 'Transferência', value: 'TRANSFER' }
      ] },
      { key: 'amount', label: 'Valor', type: 'money', required: true, validators: [positiveMoneyValidator()] },
      { key: 'notes', label: 'Observações', type: 'textarea' }
    ]
  };
}
