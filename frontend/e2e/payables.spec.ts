import { expect, test } from '@playwright/test';

type PayableRecord = {
  id: string | null;
  categoryId: string | null;
  costCenterId: string | null;
  bankAccountId: string | null;
  description: string;
  supplierName: string;
  dueDate: string;
  amount: number | string;
  paidAmount: number | string;
  status: 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes: string;
};

const companyId = 'company-1';

function createInitialPayables(): PayableRecord[] {
  return [
    {
      id: 'payable-1',
      categoryId: null,
      costCenterId: null,
      bankAccountId: null,
      description: 'Aluguel escritório',
      supplierName: 'Imobiliária Centro',
      dueDate: '2026-05-10',
      amount: 2500,
      paidAmount: 2500,
      status: 'PAID',
      notes: 'Pagamento do mês de maio'
    },
    {
      id: 'payable-2',
      categoryId: null,
      costCenterId: null,
      bankAccountId: null,
      description: 'Internet fibra',
      supplierName: 'Conecta Telecom',
      dueDate: '2026-05-15',
      amount: 299.9,
      paidAmount: 0,
      status: 'OPEN',
      notes: 'Plano empresarial'
    }
  ];
}

async function setAuthenticatedState(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(([selectedId]) => {
    window.sessionStorage.setItem(
      'auth.session',
      JSON.stringify({
        userId: 'user-1',
        name: 'Administrador',
        email: 'admin@empresa.com.br',
        accessToken: 'token-acesso',
        refreshToken: 'token-refresh'
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
            id: selectedId,
            legalName: 'Empresa Teste LTDA',
            tradeName: 'Empresa Teste',
            cnpj: '12345678000199',
            active: true
          }
        }
      ])
    );

    window.sessionStorage.setItem('company.selectedId', JSON.stringify(selectedId));
  }, [companyId]);
}

async function mockPayablesApi(page: import('@playwright/test').Page, seed = createInitialPayables()): Promise<{ records: PayableRecord[] }> {
  const state = { records: [...seed] };

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
            id: companyId,
            legalName: 'Empresa Teste LTDA',
            tradeName: 'Empresa Teste',
            cnpj: '12345678000199',
            active: true
          }
        }
      ])
    });
  });

  await page.route(`**/api/v1/companies/${companyId}/payables**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === 'GET' && path.endsWith('/payables')) {
      const search = (url.searchParams.get('search') ?? '').toLowerCase().trim();
      const filtered = search
        ? state.records.filter((item) =>
            item.description.toLowerCase().includes(search) ||
            item.supplierName.toLowerCase().includes(search) ||
            item.status.toLowerCase().includes(search)
          )
        : state.records;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: filtered,
          page: 0,
          size: 50,
          totalElements: filtered.length,
          totalPages: 1
        })
      });
      return;
    }

    if (method === 'POST' && path.endsWith('/payables')) {
      const payload = request.postDataJSON() as PayableRecord;
      const created = { ...payload, id: `payable-${state.records.length + 1}` };
      state.records.unshift(created);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(created)
      });
      return;
    }

    if (method === 'PUT') {
      const id = path.split('/').pop() ?? '';
      const payload = request.postDataJSON() as PayableRecord;
      state.records = state.records.map((item) => (item.id === id ? { ...item, ...payload, id } : item));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.records.find((item) => item.id === id))
      });
      return;
    }

    if (method === 'DELETE') {
      const id = path.split('/').pop() ?? '';
      state.records = state.records.filter((item) => item.id !== id);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ''
      });
      return;
    }

    await route.continue();
  });

  return state;
}

test.describe('Contas a pagar', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockPayablesApi(page);
    await page.goto('/finance/payables');
  });

  test('lista as contas a pagar cadastradas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contas a Pagar' }), 'A página de contas a pagar deve ser carregada.').toBeVisible();
    await expect(page.getByText('Aluguel escritório'), 'A tabela deve exibir as contas já cadastradas.').toBeVisible();
    await expect(page.getByText('Internet fibra'), 'A segunda conta mockada também deve aparecer na listagem.').toBeVisible();
    await expect(page.getByRole('button', { name: 'Nova conta a pagar' }), 'A ação principal de criação deve estar disponível.').toBeVisible();
  });

  test('permite criar uma nova conta a pagar', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova conta a pagar' }).click();

    await page.getByLabel('Descrição').fill('Licença de software');
    await page.getByLabel('Fornecedor').fill('SaaS Provedor');
    await page.getByLabel('Vencimento').fill('2026-06-20');
    await page.getByLabel('Valor', { exact: true }).fill('850');
    await page.getByLabel('Valor pago', { exact: true }).fill('0');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Aberta' }).click();
    await page.getByLabel('Observações').fill('Renovação semestral');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Operação concluída'), 'Ao salvar uma conta válida, o sistema deve informar sucesso.').toBeVisible();
    await expect(page.getByText('Licença de software'), 'A nova conta deve aparecer na listagem após o salvamento.').toBeVisible();
    await expect(page.getByText('SaaS Provedor'), 'O fornecedor cadastrado deve ser exibido na tabela.').toBeVisible();
  });

  test('permite editar uma conta a pagar existente', async ({ page }) => {
    await page.locator('tr', { hasText: 'Internet fibra' }).getByRole('button', { name: 'Editar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar registro' }), 'Ao editar um item, o formulário deve entrar em modo de edição.').toBeVisible();
    await page.getByLabel('Descrição').fill('Internet dedicada');
    await page.getByLabel('Fornecedor').fill('Conecta Telecom Premium');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Operação concluída'), 'A edição deve exibir uma confirmação de sucesso.').toBeVisible();
    await expect(page.getByText('Internet dedicada'), 'A descrição alterada deve ser refletida na tabela.').toBeVisible();
    await expect(page.getByText('Conecta Telecom Premium'), 'O fornecedor atualizado deve aparecer na linha editada.').toBeVisible();
  });

  test('permite excluir uma conta a pagar', async ({ page }) => {
    const row = page.locator('tr', { hasText: 'Aluguel escritório' });

    await row.getByRole('button', { name: 'Excluir' }).click();

    await expect(page.getByText('Registro removido'), 'A exclusão deve exibir uma mensagem de sucesso.').toBeVisible();
    await expect(page.getByText('Aluguel escritório'), 'A conta removida não deve mais aparecer na tabela.').toHaveCount(0);
  });

  test('filtra a listagem pelo campo de pesquisa', async ({ page }) => {
    await page.getByPlaceholder('Digite um termo para filtrar').fill('internet');

    await expect(page.getByText('Internet fibra'), 'O filtro deve manter os registros compatíveis com o termo pesquisado.').toBeVisible();
    await expect(page.getByText('Aluguel escritório'), 'O filtro deve ocultar os registros que não correspondem à busca.').toHaveCount(0);
  });
});
