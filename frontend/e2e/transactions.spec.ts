import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Transações financeiras', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'transactions',
      searchFields: ['description', 'type', 'transactionDate'],
      initialRecords: [
        { id: 'tx-1', categoryId: null, costCenterId: null, bankAccountId: 'bank-1', payableId: null, receivableId: null, description: 'Pagamento fornecedor', transactionDate: '2026-05-10', type: 'EXPENSE', amount: 450, notes: '' },
        { id: 'tx-2', categoryId: null, costCenterId: null, bankAccountId: 'bank-2', payableId: null, receivableId: null, description: 'Recebimento cliente', transactionDate: '2026-05-15', type: 'INCOME', amount: 1200, notes: '' }
      ]
    });
    await mockCrudResource(page, {
      endpoint: 'bank-accounts',
      searchFields: ['name', 'bankName'],
      initialRecords: [
        { id: 'bank-1', name: 'Conta Principal', bankName: '001 - Banco do Brasil S.A.', branchNumber: '1234', accountNumber: '56789X', balance: 1500, active: true },
        { id: 'bank-2', name: 'Conta Caixa', bankName: '104 - CAIXA ECONOMICA FEDERAL', branchNumber: '0001', accountNumber: '99999', balance: 500, active: true }
      ]
    });
    await page.goto('/finance/transactions');
  });

  test('lista, cria, edita, exclui e filtra transações', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transações Financeiras' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova transação' }).click();
    await page.getByLabel('Descrição').fill('Compra de licença');
    await page.getByLabel('Conta bancária').fill('Conta Principal');
    await page.getByRole('option', { name: /Conta Principal - 001 - Banco do Brasil/ }).click();
    await page.getByLabel('Data').fill('2026-06-05');
    await page.getByLabel('Tipo').click();
    await page.getByRole('option', { name: 'Despesa' }).click();
    await page.getByLabel('Valor').fill('700');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Compra de licença')).toBeVisible();

    await page.locator('tr', { hasText: 'Recebimento cliente' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Descrição').fill('Recebimento cliente premium');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Recebimento cliente premium')).toBeVisible();

    await page.locator('tr', { hasText: 'Pagamento fornecedor' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Pagamento fornecedor')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('licença');
    await expect(page.getByText('Compra de licença')).toBeVisible();
  });
});
