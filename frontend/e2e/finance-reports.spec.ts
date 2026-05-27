import { expect, test } from '@playwright/test';
import { mockFinanceDashboard, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Relatórios financeiros', () => {
  test('carrega os indicadores financeiros da empresa selecionada', async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockFinanceDashboard(page);

    await page.goto('/finance/reports');

    await expect(page.getByRole('heading', { name: 'Relatórios Financeiros' })).toBeVisible();
    await expect(page.getByText('Fluxo de caixa mensal')).toBeVisible();
    await expect(page.getByText('Receitas totais')).toBeVisible();
    await expect(page.getByText('Despesas totais')).toBeVisible();
    await expect(page.getByText('Contas a pagar', { exact: true })).toBeVisible();
    await expect(page.getByText('Contas a receber', { exact: true })).toBeVisible();
    await expect(page.getByText('Títulos vencidos')).toBeVisible();
  });
});
