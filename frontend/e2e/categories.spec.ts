import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Categorias', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'categories',
      searchFields: ['name', 'description', 'type'],
      initialRecords: [
        { id: 'category-1', name: 'Aluguel', description: 'Despesas fixas', type: 'EXPENSE', active: true },
        { id: 'category-2', name: 'Serviços', description: 'Receitas de serviços', type: 'INCOME', active: true }
      ]
    });
    await page.goto('/finance/categories');
  });

  test('lista, cria, edita, exclui e filtra categorias', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova categoria' }).click();
    await page.getByLabel('Nome').fill('Marketing');
    await page.getByLabel('Descrição').fill('Investimentos em mídia');
    await page.getByLabel('Tipo').click();
    await page.getByRole('option', { name: 'Despesa' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Marketing')).toBeVisible();

    await page.locator('tr', { hasText: 'Serviços' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Descrição').fill('Receitas recorrentes');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Receitas recorrentes')).toBeVisible();

    await page.locator('tr', { hasText: 'Aluguel' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Aluguel')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('marketing');
    await expect(page.getByText('Marketing')).toBeVisible();
  });
});
