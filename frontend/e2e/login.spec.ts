import { expect, test } from '@playwright/test';

test.describe('Login', () => {
  test('autentica o usuario e redireciona para o dashboard quando ha empresa ativa', async ({ page }) => {
    let loginPayload: unknown;

    await page.route('**/api/v1/auth/login', async (route) => {
      loginPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-1',
          name: 'Administrador',
          email: 'admin@empresa.com.br',
          accessToken: 'access-token-teste',
          refreshToken: 'refresh-token-teste'
        })
      });
    });

    await page.route('**/api/v1/users/me/memberships', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'membership-1',
            roles: ['COMPANY_ADMIN'],
            active: true,
            company: {
              id: 'company-1',
              tradeName: 'Empresa Teste',
              legalName: 'Empresa Teste LTDA',
              cnpj: '12345678000199',
              active: true
            }
          }
        ])
      });
    });

    await page.route('**/api/v1/companies/company-1/dashboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mesReferencia: '2026-05',
          fluxoCaixaMensal: 1000,
          totalReceitas: 2500,
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
          monthlyCashFlow: 1000,
          totalIncome: 2500,
          totalExpenses: 1500,
          balanceByBankAccount: { Principal: 1000 },
          openPayables: 2,
          openReceivables: 3,
          overdueBills: 1,
          expenseSummaryByCategory: { Operacional: 1500 },
          summaryByCostCenter: { Administrativo: 1500 }
        })
      });
    });

    await page.goto('/auth/login');

    await page.locator('input[formcontrolname="email"]').fill('admin@empresa.com.br');
    await page.locator('input[formcontrolname="password"]').fill('Senha@123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard Financeiro' })).toBeVisible();
    await expect(page.getByText('Empresa Teste')).toBeVisible();

    expect(loginPayload).toEqual({
      email: 'admin@empresa.com.br',
      password: 'Senha@123'
    });

    const authSession = await page.evaluate(() => window.sessionStorage.getItem('auth.session'));
    const memberships = await page.evaluate(() => window.sessionStorage.getItem('company.memberships'));
    const selectedCompanyId = await page.evaluate(() => window.sessionStorage.getItem('company.selectedId'));

    expect(authSession).not.toBeNull();
    expect(JSON.parse(authSession ?? '{}')).toMatchObject({
      userId: 'user-1',
      email: 'admin@empresa.com.br',
      accessToken: 'access-token-teste',
      refreshToken: 'refresh-token-teste'
    });
    expect(memberships).not.toBeNull();
    expect(JSON.parse(memberships ?? '[]')).toHaveLength(1);
    expect(selectedCompanyId).toBe('"company-1"');
  });
});
