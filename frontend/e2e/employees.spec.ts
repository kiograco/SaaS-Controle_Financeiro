import { expect, test } from '@playwright/test';
import { mockCrudResource, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Funcionários', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);
    await mockCrudResource(page, {
      endpoint: 'employees',
      searchFields: ['name', 'cpf', 'department', 'position'],
      initialRecords: [
        { id: 'emp-1', name: 'Ana Silva', cpf: '12345678901', email: 'ana@empresa.com.br', registrationNumber: '001', department: 'Financeiro', position: 'Analista', active: true },
        { id: 'emp-2', name: 'Bruno Costa', cpf: '98765432100', email: 'bruno@empresa.com.br', registrationNumber: '002', department: 'RH', position: 'Assistente', active: true }
      ]
    });
    await page.goto('/time-tracking/employees');
  });

  test('lista, cria, edita, exclui e filtra funcionários', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Funcionários' })).toBeVisible();
    await page.getByRole('button', { name: 'Novo funcionário' }).click();
    await page.getByLabel('Nome').fill('Carlos Souza');
    await page.getByLabel('CPF').fill('11122233344');
    await page.getByLabel('E-mail').fill('carlos@empresa.com.br');
    await page.getByLabel('Matrícula').fill('003');
    await page.getByLabel('Departamento').fill('Tecnologia');
    await page.getByLabel('Cargo').fill('Desenvolvedor');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Carlos Souza')).toBeVisible();

    await page.locator('tr', { hasText: 'Bruno Costa' }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Cargo').fill('Analista de RH');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Analista de RH')).toBeVisible();

    await page.locator('tr', { hasText: 'Ana Silva' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Ana Silva')).toHaveCount(0);

    await page.getByPlaceholder('Digite um termo para filtrar').fill('carlos');
    await expect(page.getByText('Carlos Souza')).toBeVisible();
  });
});
