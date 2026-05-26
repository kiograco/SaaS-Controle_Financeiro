import { expect, test } from '@playwright/test';
import { companyId, mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Jornadas', () => {
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
      endpoint: 'work-schedules',
      searchFields: ['name', 'startTime', 'endTime'],
      initialRecords: [
        { id: 'ws-1', name: 'Comercial', expectedDailyMinutes: 480, toleranceMinutes: 10, lunchBreakMinutes: 60, startTime: '08:00', endTime: '17:00', active: true }
      ]
    });
    await page.route(`**/api/v1/companies/${companyId}/work-schedules/assignments`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '' });
    });
    await page.goto('/time-tracking/work-schedules');
  });

  test('lista, cria, edita, exclui e vincula jornadas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Jornadas' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova jornada' }).click();
    await page.getByLabel('Nome').fill('Administrativo');
    await page.getByLabel('Horário de entrada').fill('09:00');
    await page.getByLabel('Horário de saída').fill('18:00');
    await page.getByLabel('Minutos diários esperados').fill('480');
    await page.getByLabel('Tolerância').fill('15');
    await page.getByLabel('Minutos de descanso').fill('60');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Administrativo')).toBeVisible();

    await page.locator('tr', { hasText: 'Comercial' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Tolerância').fill('20');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('20')).toBeVisible();

    await page.getByLabel('Funcionário').click();
    await page.getByRole('option', { name: 'Ana Silva' }).click();
    await page.getByLabel('Jornada').click();
    await page.getByRole('option', { name: /Administrativo|Comercial/ }).first().click();
    await page.getByRole('button', { name: 'Salvar vínculo' }).click();
    await expect(page.getByText('Jornada vinculada')).toBeVisible();

    await page.locator('tr', { hasText: 'Comercial' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Comercial')).toHaveCount(0);
  });
});
