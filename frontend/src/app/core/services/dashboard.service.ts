import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FinancialDashboard, FinancialReport, FinancialTransaction, Payable, Receivable } from '../models/finance.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getDashboard(companyId: string, month: string): Observable<FinancialDashboard> {
    return this.http.get<FinancialDashboard>(`${this.baseUrl}/companies/${companyId}/dashboard`, {
      params: this.buildParams({ month })
    });
  }

  getFinanceReport(companyId: string, month: string): Observable<FinancialReport> {
    return this.http.get<FinancialReport>(`${this.baseUrl}/companies/${companyId}/reports/monthly`, {
      params: this.buildParams({ month })
    });
  }

  /**
   * Busca as transações financeiras recentes (últimas 10)
   */
  getRecentTransactions(companyId: string): Observable<{ content: FinancialTransaction[] }> {
    return this.http.get<{ content: FinancialTransaction[] }>(
      `${this.baseUrl}/companies/${companyId}/transactions`,
      { params: this.buildParams({ page: 0, size: 10, sort: 'transactionDate,desc' }) }
    );
  }

  /**
   * Busca contas a pagar em aberto (últimas 10)
   */
  getOpenPayables(companyId: string): Observable<{ content: Payable[] }> {
    return this.http.get<{ content: Payable[] }>(
      `${this.baseUrl}/companies/${companyId}/payables`,
      { params: this.buildParams({ status: 'OPEN', page: 0, size: 10, sort: 'dueDate,asc' }) }
    );
  }

  /**
   * Busca contas a receber em aberto (últimas 10)
   */
  getOpenReceivables(companyId: string): Observable<{ content: Receivable[] }> {
    return this.http.get<{ content: Receivable[] }>(
      `${this.baseUrl}/companies/${companyId}/receivables`,
      { params: this.buildParams({ status: 'OPEN', page: 0, size: 10, sort: 'dueDate,asc' }) }
    );
  }
}
