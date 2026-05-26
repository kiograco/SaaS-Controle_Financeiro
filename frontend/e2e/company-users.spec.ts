import { expect, test } from '@playwright/test';

test.describe('Usuários e permissões', () => {
  test('lista os usuarios da empresa selecionada', async ({ page }) => {
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

      window.sessionStorage.setItem(
        'company.memberships',
        JSON.stringify([
          {
            id: 'membership-1',
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
        ])
      );

      window.sessionStorage.setItem('company.selectedId', JSON.stringify('company-1'));
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
              legalName: 'Empresa Teste LTDA',
              tradeName: 'Empresa Teste',
              cnpj: '12345678000199',
              active: true
            }
          }
        ])
      });
    });

    await page.route('**/api/v1/companies/company-1/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'company-user-1',
            name: 'Ana Silva',
            email: 'ana@empresa.com.br',
            active: true,
            roles: ['COMPANY_ADMIN']
          },
          {
            id: 'company-user-2',
            name: 'Bruno Costa',
            email: 'bruno@empresa.com.br',
            active: false,
            roles: ['FINANCE_VIEWER']
          }
        ])
      });
    });

    await page.goto('/company/users');

    await expect(page).toHaveURL(/\/company\/users$/);
    await expect(page.getByRole('heading', { name: 'Usuários e Permissões' })).toBeVisible();
    await expect(page.getByText('Ana Silva')).toBeVisible();
    await expect(page.getByText('ana@empresa.com.br')).toBeVisible();
    await expect(page.getByText('COMPANY_ADMIN')).toBeVisible();
    await expect(page.getByText('Bruno Costa')).toBeVisible();
    await expect(page.getByText('Inativo')).toBeVisible();
  });
});
