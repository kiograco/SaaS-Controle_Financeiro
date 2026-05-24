import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { BankAccount } from '../../../core/models/finance.models';
import { BankAccountService } from '../../../core/services/bank-account.service';

@Component({
  selector: 'app-bank-accounts-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class BankAccountsPageComponent {
  private readonly service = inject(BankAccountService);
  readonly config: ResourcePageConfig<BankAccount> = {
    title: 'Contas Bancárias',
    subtitle: 'Gerencie saldos, bancos e contas utilizadas no financeiro.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma conta bancária cadastrada',
    createLabel: 'Nova conta bancária',
    service: this.service,
    initialValue: () => ({ id: null, name: '', bankName: '', branchNumber: '', accountNumber: '', balance: 0, active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Conta', cell: (row) => row.name },
      { key: 'bankName', label: 'Banco', cell: (row) => row.bankName },
      { key: 'accountNumber', label: 'Número', cell: (row) => row.accountNumber }
    ],
    fields: [
      { key: 'name', label: 'Nome da conta', type: 'text', required: true },
      { key: 'bankName', label: 'Banco', type: 'text', required: true },
      { key: 'branchNumber', label: 'Agência', type: 'text' },
      { key: 'accountNumber', label: 'Número da conta', type: 'text', required: true },
      { key: 'balance', label: 'Saldo inicial', type: 'number', required: true }
    ]
  };
}
