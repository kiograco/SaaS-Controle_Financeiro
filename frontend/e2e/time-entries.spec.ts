import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Registros de ponto', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'employees',
      searchFields: ['name'],
      initialRecords: [
        { id: 'emp-1', name: 'Ana Silva', cpf: '12345678901', email: 'ana@empresa.com.br', registrationNumber: '001', department: 'Financeiro', position: 'Analista', active: true }
      ]
    });
    await mockCrudResource(page, {
      endpoint: 'time/entries',
      searchFields: ['employeeName', 'entryDate', 'type'],
      initialRecords: [
        { id: 'entry-1', employeeId: 'emp-1', employeeName: 'Ana Silva', entryDate: '2026-05-20', entryTime: '08:00', type: 'CLOCK_IN', source: 'MANUAL', notes: '' }
      ]
    });
    await page.goto('/time-tracking/time-entries');
  });

  test('lista, cria, edita, exclui e filtra registros de ponto', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Registros de Ponto' })).toBeVisible();
    await page.getByRole('button', { name: 'Novo registro' }).click();
    await page.getByLabel('Funcionário').fill('Ana');
    await page.getByRole('option', { name: 'Ana Silva' }).click();
    await page.getByLabel('Data').fill('2026-05-21');
    await page.getByLabel('Hora').fill('12:00');
    await page.getByLabel('Tipo').click();
    await page.getByRole('option', { name: 'Início do Almoço' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('2026-05-21')).toBeVisible();

    await page.locator('tr', { hasText: '2026-05-20' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Hora').fill('08:10');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('08:10')).toBeVisible();

    await page.locator('tr', { hasText: '08:10' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('08:10')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('LUNCH_START');
    await expect(page.getByText('Início do Almoço')).toBeVisible();
  });
});
