import { expect, test } from '@playwright/test';
import { companyId, mockMemberships, setAuthenticatedState } from './support/authenticated';

test.describe('Importação CSV', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthenticatedState(page);
    await mockMemberships(page);

    await page.route(`**/api/v1/companies/${companyId}/time/imports**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            { id: 'batch-1', fileName: 'maio.csv', status: 'PROCESSED', totalRows: 2, successRows: 2, errorRows: 0, createdAt: '2026-05-21T08:00:00', finishedAt: '2026-05-21T08:01:00' }
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1
        })
      });
    });

    await page.route(`**/api/v1/companies/${companyId}/time/imports/preview**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRows: 2,
          validRows: 1,
          errorRows: 1,
          rows: [
            { rowNumber: 1, cpf: '12345678901', nome: 'Ana Silva', departamento: 'Financeiro', data: '2026-05-21', hora: '08:00', tipo: 'Entrada', valido: true, mensagem: 'OK' },
            { rowNumber: 2, cpf: '12345678901', nome: 'Ana Silva', departamento: 'Financeiro', data: '2026-05-21', hora: '12:00', tipo: 'Saída', valido: false, mensagem: 'Horário inválido' }
          ]
        })
      });
    });

    await page.route(`**/api/v1/companies/${companyId}/time/imports/confirm**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ batchId: 'batch-2', totalRows: 2, successRows: 1, errorRows: 1, status: 'PROCESSED' })
      });
    });

    await page.route(`**/api/v1/companies/${companyId}/time/imports/batch-1/errors`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ rowNumber: 2, errorMessage: 'Horário inválido' }])
      });
    });

    await page.route(`**/api/v1/companies/${companyId}/time/imports/batch-1`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '' });
        return;
      }
      await route.continue();
    });

    await page.goto('/time-tracking/imports');
  });

  test('gera preview, confirma importação, abre erros e exclui lote', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Importação CSV' })).toBeVisible();

    await page.setInputFiles('input[type="file"]', {
      name: 'ponto.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('cpf;data;hora;tipo;nome;matricula;departamento;observacao\n123;2026-05-21;08:00;Entrada;Ana;1;Financeiro;')
    });

    await page.getByRole('button', { name: 'Gerar preview' }).click();
    await expect(page.getByText('Resultado do preview')).toBeVisible();
    await expect(page.getByText('1 linhas válidas e 1 linhas inválidas.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir espelho do período' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir relatório do mês' })).toBeVisible();

    await page.getByRole('button', { name: 'Confirmar importação' }).click();
    await expect(page.getByText('Importação concluída')).toBeVisible();

    await page.getByText('maio.csv').click();
    await expect(page.getByText('Linha 2: Horário inválido')).toBeVisible();

    await page.getByRole('button', { name: 'Excluir CSV importado' }).click();
    await expect(page.getByText('Importação excluída')).toBeVisible();
  });
});
