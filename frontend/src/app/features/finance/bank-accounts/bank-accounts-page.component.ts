import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { BankAccount } from '../../../core/models/finance.models';
import { BankAccountService } from '../../../core/services/bank-account.service';
import { BRAZILIAN_BANK_OPTIONS } from '../../../core/data/brazilian-banks';
import { bankAccountNumberValidator, digitsOnlyValidator, nonNegativeMoneyValidator } from '../../../shared/validators/br-validators';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeAccountNumber(value: string, bankName: string): string {
  const upperValue = value.toUpperCase();
  const isBancoDoBrasil = bankName.startsWith('001 - Banco do Brasil S.A.');

  if (!isBancoDoBrasil) {
    return digitsOnly(upperValue);
  }

  const stripped = upperValue.replace(/[^0-9X]/g, '');
  const digits = stripped.replace(/X/g, '');
  return stripped.includes('X') ? `${digits}X` : digits;
}

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
      { key: 'bankName', label: 'Banco', type: 'select', required: true, searchable: true, options: BRAZILIAN_BANK_OPTIONS },
      {
        key: 'branchNumber',
        label: 'Agência',
        type: 'text',
        inputMode: 'numeric',
        maxLength: 10,
        validators: [digitsOnlyValidator()],
        transformInput: (value) => digitsOnly(value)
      },
      {
        key: 'accountNumber',
        label: 'Número da conta',
        type: 'text',
        required: true,
        inputMode: 'text',
        maxLength: 20,
        validators: [bankAccountNumberValidator()],
        transformInput: (value, formValue) => normalizeAccountNumber(value, String(formValue['bankName'] ?? ''))
      },
      { key: 'balance', label: 'Saldo inicial', type: 'money', required: true, validators: [nonNegativeMoneyValidator()] }
    ]
  };
}
