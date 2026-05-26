import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { FinancialReport } from '../../../core/models/finance.models';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-finance-reports-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, MetricCardComponent, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Relatórios Financeiros" subtitle="Resumo mensal consolidado da empresa selecionada." eyebrow="Relatórios" />
      <app-empty-state *ngIf="!companyContext.selectedCompanyId()" title="Selecione uma empresa" description="Os relatórios serão exibidos após selecionar uma empresa." />
      <section class="cards" *ngIf="report() as data">
        <app-metric-card title="Fluxo de caixa mensal" helper="Resultado do período" [value]="data.monthlyCashFlow" />
        <app-metric-card title="Receitas totais" helper="Entradas registradas" [value]="data.totalIncome" />
        <app-metric-card title="Despesas totais" helper="Saídas registradas" [value]="data.totalExpenses" />
        <app-metric-card title="Contas a pagar" helper="Pendências atuais" [value]="data.openPayables" />
        <app-metric-card title="Contas a receber" helper="Recebimentos pendentes" [value]="data.openReceivables" />
        <app-metric-card title="Títulos vencidos" helper="Quantidade de ocorrências" [currency]="false" [value]="data.overdueBills" />
      </section>
    </div>
  `,
  styles: [`.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; } @media (max-width: 1000px) { .cards { grid-template-columns: 1fr; } }`]
})
export class FinanceReportsPageComponent {
  readonly companyContext = inject(CompanyContextService);
  private readonly service = inject(DashboardService);
  readonly report = signal<FinancialReport | null>(null);

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.report.set(null);
        return;
      }
      this.service.getFinanceReport(companyId, new Date().toISOString().slice(0, 7)).subscribe((report) => this.report.set(report));
    }, { allowSignalWrites: true });
  }
}
