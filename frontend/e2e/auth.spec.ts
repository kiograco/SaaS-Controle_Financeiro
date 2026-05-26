import { expect, Page, test as base } from '@playwright/test';

base.use({ storageState: undefined });

const validEmail = 'testuser@empresa.com';
const validPassword = 'Senha@2025';

async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
}

async function fillRegisterForm(page: Page, values?: { name?: string; email?: string; password?: string }): Promise<void> {
  if (values?.name !== undefined) {
    await page.getByLabel('Nome').fill(values.name);
  }
  if (values?.email !== undefined) {
    await page.getByLabel('E-mail').fill(values.email);
  }
  if (values?.password !== undefined) {
    await page.getByLabel('Senha').fill(values.password);
  }
}

async function mockMemberships(page: Page, options?: { selectedCompanyId?: string | null; memberships?: unknown[] }): Promise<void> {
  const selectedCompanyId = options?.selectedCompanyId ?? null;
  const memberships = options?.memberships ?? [];

  await page.addInitScript(([companyId]) => {
    if (companyId) {
      window.sessionStorage.setItem('company.selectedId', JSON.stringify(companyId));
    } else {
      window.sessionStorage.removeItem('company.selectedId');
    }
  }, [selectedCompanyId]);

  await page.route('**/api/v1/users/me/memberships', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(memberships)
    });
  });
}

async function mockDashboard(page: Page, companyId = 'company-1'): Promise<void> {
  await page.route(`**/api/v1/companies/${companyId}/dashboard*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mesReferencia: '2026-05',
        fluxoCaixaMensal: 2500,
        totalReceitas: 5500,
        totalDespesas: 3000,
        contasPagarEmAberto: 4,
        contasReceberEmAberto: 7,
        contasVencidas: 1
      })
    });
  });

  await page.route(`**/api/v1/companies/${companyId}/reports/monthly*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthlyCashFlow: 2500,
        totalIncome: 5500,
        totalExpenses: 3000,
        balanceByBankAccount: { Principal: 2500 },
        openPayables: 4,
        openReceivables: 7,
        overdueBills: 1,
        expenseSummaryByCategory: { Operacional: 3000 },
        summaryByCostCenter: { Administrativo: 3000 }
      })
    });
  });
}

// Cenários de autenticação do usuário final, cobrindo sucesso, erros e persistência de sessão.
base.describe('Fluxos de autenticação', () => {
  // Grupo da tela de login com mocks de autenticação e validações de formulário.
  base.describe('Login', () => {
    base.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    base('login com credenciais válidas redireciona para o dashboard', async ({ page }) => {
      await mockMemberships(page, {
        selectedCompanyId: 'company-1',
        memberships: [
          {
            id: 'membership-1',
            roles: ['COMPANY_ADMIN'],
            active: true,
            company: {
              id: 'company-1',
              legalName: 'Empresa QA LTDA',
              tradeName: 'Empresa QA',
              cnpj: '12345678000199',
              active: true
            }
          }
        ]
      });
      await mockDashboard(page);
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: 'user-qa-1',
            name: 'Usuário de Teste',
            email: validEmail,
            accessToken: 'token-acesso-valido',
            refreshToken: 'token-refresh-valido'
          })
        });
      });

      await page.reload();
      await fillLoginForm(page, validEmail, validPassword);
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page, 'O login válido deve redirecionar para o dashboard.').toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { name: 'Dashboard Financeiro' }), 'O dashboard deve ficar visível após autenticação bem-sucedida.').toBeVisible();
      await expect(page.getByText('Empresa QA'), 'A empresa ativa deve aparecer após o login.').toBeVisible();
    });

    base('login com e-mail inválido exibe mensagem de erro do formulário', async ({ page }) => {
      await page.getByLabel('E-mail').fill('email-invalido');
      await page.getByLabel('Senha').fill(validPassword);
      await page.getByLabel('Senha').press('Tab');

      await expect(page.getByText('Informe um e-mail válido.'), 'O formulário deve orientar o usuário quando o e-mail estiver inválido.').toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' }), 'O botão de entrar deve permanecer desabilitado com e-mail inválido.').toBeDisabled();
    });

    base('login com senha incorreta exibe erro de autenticação', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Senha incorreta. Verifique os dados e tente novamente.'
          })
        });
      });

      await fillLoginForm(page, validEmail, 'Senha@2026');
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page.getByText('Falha na autenticação'), 'A tela deve informar que a autenticação falhou quando a senha estiver incorreta.').toBeVisible();
      await expect(page.getByText('Senha incorreta. Verifique os dados e tente novamente.'), 'A mensagem específica de senha incorreta deve ser exibida ao usuário.').toBeVisible();
    });

    base('login com campos vazios exibe as validações obrigatórias', async ({ page }) => {
      await page.getByLabel('E-mail').focus();
      await page.getByLabel('E-mail').press('Tab');
      await page.getByLabel('Senha').press('Tab');

      await expect(page.getByText('Informe um e-mail válido.'), 'O campo de e-mail deve mostrar validação quando ficar vazio e tocado.').toBeVisible();
      await expect(page.getByText('Informe sua senha.'), 'O campo de senha deve mostrar validação quando ficar vazio e tocado.').toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' }), 'O envio não deve ser permitido com campos obrigatórios vazios.').toBeDisabled();
    });

    base('persistência de sessão mantém o usuário autenticado após reload', async ({ page }) => {
      await mockMemberships(page, {
        selectedCompanyId: 'company-1',
        memberships: [
          {
            id: 'membership-1',
            roles: ['COMPANY_ADMIN'],
            active: true,
            company: {
              id: 'company-1',
              legalName: 'Empresa QA LTDA',
              tradeName: 'Empresa QA',
              cnpj: '12345678000199',
              active: true
            }
          }
        ]
      });
      await mockDashboard(page);
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: 'user-qa-1',
            name: 'Usuário de Teste',
            email: validEmail,
            accessToken: 'token-acesso-valido',
            refreshToken: 'token-refresh-valido'
          })
        });
      });

      await page.reload();
      await fillLoginForm(page, validEmail, validPassword);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await expect(page, 'O usuário precisa estar autenticado antes de validar a persistência de sessão.').toHaveURL(/\/dashboard$/);

      await page.reload();

      await expect(page, 'Após recarregar a página, a sessão autenticada deve ser preservada.').toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { name: 'Dashboard Financeiro' }), 'O dashboard deve continuar acessível após o reload com sessão persistida.').toBeVisible();
    });
  });

  // Grupo da tela de cadastro cobrindo sucesso, duplicidade e validações de formulário.
  base.describe('Registro de usuário', () => {
    base.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
    });

    base('registro com todos os campos válidos conclui com sucesso e redireciona', async ({ page }) => {
      await mockMemberships(page, { memberships: [] });
      await page.route('**/api/v1/auth/register', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: 'user-qa-2',
            name: 'Usuário Cadastro',
            email: validEmail,
            accessToken: 'token-cadastro',
            refreshToken: 'refresh-cadastro'
          })
        });
      });

      await page.reload();
      await fillRegisterForm(page, {
        name: 'Usuário Cadastro',
        email: validEmail,
        password: validPassword
      });
      await page.getByRole('button', { name: 'Criar conta' }).click();

      await expect(page, 'Após cadastro válido, o fluxo atual da aplicação deve redirecionar para configurações.').toHaveURL(/\/settings$/);
      await expect(page.getByRole('heading', { name: 'Configurações' }), 'A página de configurações deve ser exibida após o cadastro bem-sucedido.').toBeVisible();
    });

    base('registro com e-mail já cadastrado exibe erro específico', async ({ page }) => {
      await page.route('**/api/v1/auth/register', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'E-mail já cadastrado.'
          })
        });
      });

      await fillRegisterForm(page, {
        name: 'Usuário Duplicado',
        email: validEmail,
        password: validPassword
      });
      await page.getByRole('button', { name: 'Criar conta' }).click();

      await expect(page.getByText('Erro'), 'O cadastro deve exibir um toast de erro quando o e-mail já existir.').toBeVisible();
      await expect(page.getByText('E-mail já cadastrado.'), 'A mensagem específica de e-mail duplicado deve ser apresentada ao usuário.').toBeVisible();
    });

    base('registro com senha fraca exibe os requisitos mínimos', async ({ page }) => {
      await fillRegisterForm(page, {
        name: 'Usuário Fraco',
        email: validEmail,
        password: '1234567'
      });
      await page.getByLabel('Senha').press('Tab');

      await expect(page.getByText('A senha deve ter pelo menos 8 caracteres.'), 'A tela deve orientar o usuário sobre o tamanho mínimo da senha.').toBeVisible();
      await expect(page.getByRole('button', { name: 'Criar conta' }), 'O cadastro não deve ser permitido com senha abaixo do mínimo configurado.').toBeDisabled();
    });

    base('registro com campos obrigatórios vazios exibe as validações do formulário', async ({ page }) => {
      await page.getByLabel('Nome').focus();
      await page.getByLabel('Nome').press('Tab');
      await page.getByLabel('E-mail').press('Tab');
      await page.getByLabel('Senha').press('Tab');

      await expect(page.getByText('Informe seu nome.'), 'O campo nome deve exibir validação obrigatória quando ficar vazio.').toBeVisible();
      await expect(page.getByText('Informe um e-mail válido.'), 'O campo e-mail deve exibir validação obrigatória quando ficar vazio.').toBeVisible();
      await expect(page.getByText('A senha deve ter pelo menos 8 caracteres.'), 'O campo senha deve exibir validação obrigatória ou de tamanho mínimo quando ficar vazio.').toBeVisible();
      await expect(page.getByRole('button', { name: 'Criar conta' }), 'O botão de cadastro deve permanecer desabilitado com campos obrigatórios vazios.').toBeDisabled();
    });

    base.fixme('confirmação de senha divergente exibe erro', 'A UI atual não possui campo de confirmação de senha; o cenário deve ser ativado quando o fluxo existir.');
  });
});

export const authenticatedPage = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await mockMemberships(page, {
      selectedCompanyId: 'company-1',
      memberships: [
        {
          id: 'membership-1',
          roles: ['COMPANY_ADMIN'],
          active: true,
          company: {
            id: 'company-1',
            legalName: 'Empresa QA LTDA',
            tradeName: 'Empresa QA',
            cnpj: '12345678000199',
            active: true
          }
        }
      ]
    });
    await mockDashboard(page);
    await page.addInitScript(([email, password]) => {
      window.sessionStorage.setItem(
        'auth.session',
        JSON.stringify({
          userId: 'user-qa-1',
          name: 'Usuário de Teste',
          email,
          accessToken: 'token-acesso-valido',
          refreshToken: 'token-refresh-valido'
        })
      );
      window.sessionStorage.setItem('company.selectedId', JSON.stringify('company-1'));
      void password;
    }, [validEmail, validPassword]);

    await page.goto('/dashboard');
    await use(page);
  }
});

export { fillLoginForm };
