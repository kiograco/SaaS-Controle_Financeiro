import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { CompanyContextService } from '../../core/services/company-context.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { FinancialDashboard, FinancialReport } from '../../core/models/finance.models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, MetricCardComponent, ChartCardComponent, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Dashboard Financeiro" subtitle="Acompanhe os principais indicadores da empresa selecionada." eyebrow="Visão Geral" />
      <app-empty-state *ngIf="!companyContext.selectedCompanyId()" title="Selecione uma empresa" description="Escolha uma empresa no topo para carregar o dashboard." />
      <ng-container *ngIf="companyContext.selectedCompanyId()">
        <section class="cards">
          <app-metric-card title="Receita do mês" helper="Receitas lançadas no período" [value]="dashboard()?.totalReceitas ?? 0" />
          <app-metric-card title="Despesas do mês" helper="Despesas consolidadas" [value]="dashboard()?.totalDespesas ?? 0" />
          <app-metric-card title="Saldo atual" helper="Fluxo de caixa mensal" [value]="dashboard()?.fluxoCaixaMensal ?? 0" />
          <app-metric-card title="Contas a pagar" helper="Títulos em aberto" [value]="dashboard()?.contasPagarEmAberto ?? 0" />
          <app-metric-card title="Contas a receber" helper="Valores pendentes" [value]="dashboard()?.contasReceberEmAberto ?? 0" />
          <app-metric-card title="Títulos vencidos" helper="Itens que exigem atenção" [currency]="false" [value]="dashboard()?.contasVencidas ?? 0" />
        </section>

        <section class="charts">
          <app-chart-card
            title="Despesas por categoria"
            subtitle="Participação das principais categorias"
            [loading]="loading()"
            [hasData]="categoryChart.data.labels?.length !== 0"
            type="doughnut"
            [data]="categoryChart.data"
            [options]="categoryChart.options" />

          <app-chart-card
            title="Resumo por centro de custo"
            subtitle="Acompanhe o consumo por área"
            [loading]="loading()"
            [hasData]="costCenterChart.data.labels?.length !== 0"
            type="bar"
            [data]="costCenterChart.data"
            [options]="costCenterChart.options" />

          <app-chart-card
            title="Saldo por conta bancária"
            subtitle="Distribuição do caixa entre contas"
            [loading]="loading()"
            [hasData]="bankChart.data.labels?.length !== 0"
            type="bar"
            [data]="bankChart.data"
            [options]="bankChart.options" />
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .charts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    app-chart-card { min-height: 360px; display: block; }
    @media (max-width: 1100px) {
      .cards, .charts { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardPageComponent {
  readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(DashboardService);
  readonly loading = signal(false);
  readonly dashboard = signal<FinancialDashboard | null>(null);

  readonly categoryChart: { data: ChartConfiguration['data']; options: ChartConfiguration['options'] } = {
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false }
  };
  readonly costCenterChart = {
    data: { labels: [], datasets: [] } as ChartConfiguration['data'],
    options: { responsive: true, maintainAspectRatio: false } as ChartConfiguration['options']
  };
  readonly bankChart = {
    data: { labels: [], datasets: [] } as ChartConfiguration['data'],
    options: { responsive: true, maintainAspectRatio: false } as ChartConfiguration['options']
  };

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.dashboard.set(null);
        this.resetCharts();
        this.loading.set(false);
        return;
      }
      this.load(companyId);
    }, { allowSignalWrites: true });
  }

  private load(companyId: string): void {
    const month = new Date().toISOString().slice(0, 7);
    this.loading.set(true);
    this.service.getDashboard(companyId, month).subscribe({
      next: (dashboard) => this.dashboard.set(dashboard)
    });
    this.service.getFinanceReport(companyId, month).subscribe({
      next: (report) => {
        this.populateCharts(report);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private populateCharts(report: FinancialReport): void {
    this.categoryChart.data = {
      labels: Object.keys(report.expenseSummaryByCategory),
      datasets: [{ data: Object.values(report.expenseSummaryByCategory), backgroundColor: ['#0e8f73', '#147ba6', '#f0a43b', '#d95b5b'] }]
    };
    this.costCenterChart.data = {
      labels: Object.keys(report.summaryByCostCenter),
      datasets: [{ label: 'Total', data: Object.values(report.summaryByCostCenter), backgroundColor: '#0e8f73' }]
    };
    this.bankChart.data = {
      labels: Object.keys(report.balanceByBankAccount),
      datasets: [{ label: 'Saldo', data: Object.values(report.balanceByBankAccount), backgroundColor: '#147ba6' }]
    };
  }

  private resetCharts(): void {
    this.categoryChart.data = { labels: [], datasets: [] };
    this.costCenterChart.data = { labels: [], datasets: [] };
    this.bankChart.data = { labels: [], datasets: [] };
  }
}
