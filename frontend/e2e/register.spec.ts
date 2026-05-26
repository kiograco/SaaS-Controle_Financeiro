import { expect, test } from '@playwright/test';

test.describe('Cadastro de usuário', () => {
  test('cria a conta e redireciona para configuracoes quando nao ha empresa selecionada', async ({ page }) => {
    let registerPayload: unknown;

    await page.route('**/api/v1/auth/register', async (route) => {
      registerPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-2',
          name: 'Nova Pessoa',
          email: 'nova@empresa.com.br',
          accessToken: 'access-token-cadastro',
          refreshToken: 'refresh-token-cadastro'
        })
      });
    });

    await page.route('**/api/v1/users/me/memberships', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/auth/register');

    await page.locator('input[formcontrolname="name"]').fill('Nova Pessoa');
    await page.locator('input[formcontrolname="email"]').fill('nova@empresa.com.br');
    await page.locator('input[formcontrolname="password"]').fill('Senha@123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
    await expect(page.getByText('Seu usuário já está autenticado, mas ainda não possui uma empresa para operar no sistema.')).toBeVisible();

    expect(registerPayload).toEqual({
      name: 'Nova Pessoa',
      email: 'nova@empresa.com.br',
      password: 'Senha@123'
    });

    const authSession = await page.evaluate(() => window.sessionStorage.getItem('auth.session'));
    const memberships = await page.evaluate(() => window.sessionStorage.getItem('company.memberships'));

    expect(authSession).not.toBeNull();
    expect(JSON.parse(authSession ?? '{}')).toMatchObject({
      userId: 'user-2',
      name: 'Nova Pessoa',
      email: 'nova@empresa.com.br',
      accessToken: 'access-token-cadastro',
      refreshToken: 'refresh-token-cadastro'
    });
    expect(memberships).toBe('[]');
  });
});
