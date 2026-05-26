import { expect, test } from '@playwright/test';
import { companyId, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Relatórios de ponto', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await page.route(`**/api/v1/companies/${companyId}/time/reports/monthly**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          referencia: '2026-05',
          totalFuncionarios: 2,
          totalMinutosTrabalhados: 960,
          totalHorasExtras: 60,
          totalMinutosEmFalta: 15,
          funcionarios: [
            { employeeId: 'emp-1', employeeName: 'Ana Silva', workedMinutes: 480, overtimeMinutes: 30, missingMinutes: 0 },
            { employeeId: 'emp-2', employeeName: 'Bruno Costa', workedMinutes: 480, overtimeMinutes: 30, missingMinutes: 15 }
          ]
        })
      });
    });
    await page.goto('/time-tracking/reports');
  });

  test('carrega o relatório mensal e permite aplicar outro mês', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Relatórios de Ponto' })).toBeVisible();
    await expect(page.getByText('Total de horas trabalhadas')).toBeVisible();
    await expect(page.getByText('Horas extras')).toBeVisible();
    await expect(page.getByText('Faltas')).toBeVisible();
    await expect(page.getByText('Ana Silva')).toBeVisible();
    await page.locator('input[type="month"]').fill('2026-04');
    await page.getByRole('button', { name: 'Aplicar mês' }).click();
    await expect(page.getByText('Bruno Costa')).toBeVisible();
  });
});
