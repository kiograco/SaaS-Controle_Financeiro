import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Contas bancárias', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'bank-accounts',
      searchFields: ['name', 'bankName', 'accountNumber'],
      initialRecords: [
        { id: 'bank-1', name: 'Conta Principal', bankName: '001 - Banco do Brasil S.A.', branchNumber: '1234', accountNumber: '56789X', balance: 1500, active: true },
        { id: 'bank-2', name: 'Reserva', bankName: '104 - CAIXA ECONOMICA FEDERAL', branchNumber: '0001', accountNumber: '99999', balance: 500, active: true }
      ]
    });
    await page.goto('/finance/bank-accounts');
  });

  test('lista, cria, edita, exclui e filtra contas bancárias', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contas Bancárias' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova conta bancária' }).click();
    await page.getByLabel('Nome da conta').fill('Operacional');
    await page.getByLabel('Banco').fill('Banco do Brasil');
    await page.getByRole('option', { name: /001 - Banco do Brasil/ }).click();
    await page.getByLabel('Agência').fill('4321');
    await page.getByLabel('Número da conta').fill('12345X');
    await page.getByLabel('Saldo inicial').fill('3200');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Operacional')).toBeVisible();

    await page.locator('tr', { hasText: 'Reserva' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Número da conta').fill('88888');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('88888')).toBeVisible();

    await page.locator('tr', { hasText: 'Conta Principal' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Conta Principal')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('operacional');
    await expect(page.getByText('Operacional')).toBeVisible();
  });
});
