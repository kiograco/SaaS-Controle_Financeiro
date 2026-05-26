import { expect, test } from '@playwright/test';

test.describe('Cadastro de empresa', () => {
  test('cria a empresa, seleciona no contexto e redireciona para dashboard', async ({ page }) => {
    let createCompanyPayload: unknown;
    let membershipsRequestCount = 0;

    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'auth.session',
        JSON.stringify({
          userId: 'user-1',
          name: 'Administrador',
          email: 'admin@empresa.com.br',
          accessToken: 'access-token-auth',
          refreshToken: 'refresh-token-auth'
        })
      );
    });

    await page.route('**/api/v1/users/me/memberships', async (route) => {
      membershipsRequestCount += 1;

      const body = membershipsRequestCount === 1
        ? []
        : [
            {
              id: 'membership-empresa-1',
              roles: ['COMPANY_ADMIN'],
              active: true,
              company: {
                id: 'company-1',
                legalName: 'Empresa Teste LTDA',
                tradeName: 'Empresa Teste',
                cnpj: '12345678000199',
                active: true
              }
            }
          ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body)
      });
    });

    await page.route('**/api/v1/companies', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      createCompanyPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'company-1',
          legalName: 'Empresa Teste LTDA',
          tradeName: 'Empresa Teste',
          cnpj: '12345678000199',
          active: true
        })
      });
    });

    await page.route('**/api/v1/companies/company-1/dashboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mesReferencia: '2026-05',
          fluxoCaixaMensal: 1500,
          totalReceitas: 3000,
          totalDespesas: 1500,
          contasPagarEmAberto: 2,
          contasReceberEmAberto: 3,
          contasVencidas: 1
        })
      });
    });

    await page.route('**/api/v1/companies/company-1/reports/monthly*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monthlyCashFlow: 1500,
          totalIncome: 3000,
          totalExpenses: 1500,
          balanceByBankAccount: { Caixa: 1500 },
          openPayables: 2,
          openReceivables: 3,
          overdueBills: 1,
          expenseSummaryByCategory: { Operacional: 1500 },
          summaryByCostCenter: { Administrativo: 1500 }
        })
      });
    });

    await page.goto('/company/create');

    await page.locator('input[formcontrolname="legalName"]').fill('Empresa Teste LTDA');
    await page.locator('input[formcontrolname="tradeName"]').fill('Empresa Teste');
    await page.locator('input[formcontrolname="cnpj"]').fill('12.345.678/0001-99');
    await page.getByRole('button', { name: 'Criar empresa' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard Financeiro' })).toBeVisible();
    await expect(page.getByText('Empresa Teste')).toBeVisible();

    expect(createCompanyPayload).toEqual({
      legalName: 'Empresa Teste LTDA',
      tradeName: 'Empresa Teste',
      cnpj: '12.345.678/0001-99'
    });

    const memberships = await page.evaluate(() => window.sessionStorage.getItem('company.memberships'));
    const selectedCompanyId = await page.evaluate(() => window.sessionStorage.getItem('company.selectedId'));

    expect(memberships).not.toBeNull();
    expect(JSON.parse(memberships ?? '[]')).toMatchObject([
      {
        id: 'membership-empresa-1',
        roles: ['COMPANY_ADMIN'],
        company: {
          id: 'company-1',
          tradeName: 'Empresa Teste'
        }
      }
    ]);
    expect(selectedCompanyId).toBe('"company-1"');
  });
});
