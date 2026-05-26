import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Contas a receber', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'receivables',
      searchFields: ['description', 'customerName', 'status'],
      initialRecords: [
        { id: 'receivable-1', categoryId: null, costCenterId: null, bankAccountId: null, description: 'Mensalidade ERP', customerName: 'Cliente Alfa', dueDate: '2026-05-10', amount: 1200, receivedAmount: 1200, status: 'PAID', notes: '' },
        { id: 'receivable-2', categoryId: null, costCenterId: null, bankAccountId: null, description: 'Consultoria', customerName: 'Cliente Beta', dueDate: '2026-05-18', amount: 800, receivedAmount: 0, status: 'OPEN', notes: '' }
      ]
    });
    await page.goto('/finance/receivables');
  });

  test('lista, cria, edita, exclui e filtra contas a receber', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contas a Receber' })).toBeVisible();
    await expect(page.getByText('Mensalidade ERP')).toBeVisible();

    await page.getByRole('button', { name: 'Nova conta a receber' }).click();
    await page.getByLabel('Descrição').fill('Treinamento');
    await page.getByLabel('Cliente').fill('Cliente Gama');
    await page.getByLabel('Vencimento').fill('2026-06-21');
    await page.getByLabel('Valor', { exact: true }).fill('600');
    await page.getByLabel('Valor recebido', { exact: true }).fill('0');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Aberta' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Treinamento')).toBeVisible();

    await page.locator('tr', { hasText: 'Consultoria' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Cliente').fill('Cliente Beta Prime');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Cliente Beta Prime')).toBeVisible();

    await page.locator('tr', { hasText: 'Mensalidade ERP' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Mensalidade ERP')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('treinamento');
    await expect(page.getByText('Treinamento')).toBeVisible();
    await expect(page.getByText('Consultoria')).toHaveCount(0);
  });
});
