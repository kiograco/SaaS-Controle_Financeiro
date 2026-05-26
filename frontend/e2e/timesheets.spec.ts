import { expect, test } from '@playwright/test';
import { companyId, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Espelhos de ponto', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await page.route(`**/api/v1/companies/${companyId}/time/sheets**`, async (route) => {
      const url = new URL(route.request().url());
      const startDate = url.searchParams.get('startDate');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            { id: 'sheet-1', employeeId: 'emp-1', employeeName: 'Ana Silva', referenceDate: startDate ?? '2026-05-21', workedMinutes: 480, overtimeMinutes: 30, missingMinutes: 0, status: 'OVERTIME', calculatedAt: '2026-05-21T18:00:00' }
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1
        })
      });
    });
    await page.goto('/time-tracking/timesheets');
  });

  test('lista espelhos e aplica filtros por período', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Espelhos de Ponto' })).toBeVisible();
    await expect(page.getByText('Ana Silva')).toBeVisible();
    await page.locator('input[type="date"]').first().fill('2026-05-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-05-31');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(page).toHaveURL(/startDate=2026-05-01/);
    await expect(page).toHaveURL(/endDate=2026-05-31/);
  });
});
