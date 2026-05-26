import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Centros de custo', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'cost-centers',
      searchFields: ['name', 'code'],
      initialRecords: [
        { id: 'cc-1', name: 'Administrativo', code: 'ADM', active: true },
        { id: 'cc-2', name: 'Comercial', code: 'COM', active: true }
      ]
    });
    await page.goto('/finance/cost-centers');
  });

  test('lista, cria, edita, exclui e filtra centros de custo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Centros de Custo' })).toBeVisible();
    await page.getByRole('button', { name: 'Novo centro de custo' }).click();
    await page.getByLabel('Nome').fill('Tecnologia');
    await page.getByLabel('Código').fill('TEC');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Tecnologia')).toBeVisible();

    await page.locator('tr', { hasText: 'Comercial' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Código').fill('COMX');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('COMX')).toBeVisible();

    await page.locator('tr', { hasText: 'Administrativo' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Administrativo')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('tec');
    await expect(page.getByText('Tecnologia')).toBeVisible();
  });
});
