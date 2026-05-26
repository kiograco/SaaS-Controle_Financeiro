import type { Page, Route } from '@playwright/test';

export const companyId = 'company-1';

type MembershipOptions = {
  companyTradeName?: string;
  roles?: string[];
};

export async function setAuthenticatedState(page: Page, options?: MembershipOptions): Promise<void> {
  const companyTradeName = options?.companyTradeName ?? 'Empresa Teste';
  const roles = options?.roles ?? ['COMPANY_ADMIN'];

  await page.addInitScript(([selectedId, tradeName, membershipRoles]) => {
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
          roles: membershipRoles,
          active: true,
          company: {
            id: selectedId,
            legalName: `${tradeName} LTDA`,
            tradeName,
            cnpj: '12345678000199',
            active: true
          }
        }
      ])
    );

    window.sessionStorage.setItem('company.selectedId', JSON.stringify(selectedId));
  }, [companyId, companyTradeName, roles]);
}

export async function mockMemberships(page: Page, options?: MembershipOptions): Promise<void> {
  const companyTradeName = options?.companyTradeName ?? 'Empresa Teste';
  const roles = options?.roles ?? ['COMPANY_ADMIN'];

  await page.route('**/api/v1/users/me/memberships', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'membership-1',
          roles,
          active: true,
          company: {
            id: companyId,
            legalName: `${companyTradeName} LTDA`,
            tradeName: companyTradeName,
            cnpj: '12345678000199',
            active: true
          }
        }
      ])
    });
  });
}

export async function mockCrudResource<T extends { id: string | null }>(
  page: Page,
  options: {
    endpoint: string;
    initialRecords: T[];
    searchFields: Array<keyof T>;
  }
): Promise<{ records: T[] }> {
  const state = { records: [...options.initialRecords] };
  const basePath = `/api/v1/companies/${companyId}/${options.endpoint}`;

  await page.route(`**${basePath}**`, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === 'GET' && path.endsWith(`/${options.endpoint}`)) {
      const search = (url.searchParams.get('search') ?? '').toLowerCase().trim();
      const filtered = search
        ? state.records.filter((item) =>
            options.searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(search))
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

    if (method === 'POST' && path.endsWith(`/${options.endpoint}`)) {
      const payload = request.postDataJSON() as T;
      const created = { ...payload, id: `${options.endpoint}-${state.records.length + 1}` } as T;
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
      const payload = request.postDataJSON() as T;
      state.records = state.records.map((item) => (item.id === id ? ({ ...item, ...payload, id } as T) : item));

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

export async function mockFinanceDashboard(page: Page): Promise<void> {
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
