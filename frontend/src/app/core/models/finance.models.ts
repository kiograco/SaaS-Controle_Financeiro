export type CategoryType = 'INCOME' | 'EXPENSE';
export type DocumentStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Category {
  id: string | null;
  name: string;
  description: string;
  type: CategoryType;
  active: boolean;
}

export interface CostCenter {
  id: string | null;
  name: string;
  code: string;
  active: boolean;
}

export interface BankAccount {
  id: string | null;
  name: string;
  bankName: string;
  branchNumber: string;
  accountNumber: string;
  balance: number;
  active: boolean;
}

export interface Payable {
  id: string | null;
  categoryId: string | null;
  costCenterId: string | null;
  bankAccountId: string | null;
  description: string;
  supplierName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: DocumentStatus;
  notes: string;
}

export interface Receivable {
  id: string | null;
  categoryId: string | null;
  costCenterId: string | null;
  bankAccountId: string | null;
  description: string;
  customerName: string;
  dueDate: string;
  amount: number;
  receivedAmount: number;
  status: DocumentStatus;
  notes: string;
}

export interface FinancialTransaction {
  id: string | null;
  categoryId: string | null;
  costCenterId: string | null;
  bankAccountId: string;
  payableId: string | null;
  receivableId: string | null;
  description: string;
  transactionDate: string;
  type: TransactionType;
  amount: number;
  notes: string;
}

export interface FinancialDashboard {
  mesReferencia: string;
  fluxoCaixaMensal: number;
  totalReceitas: number;
  totalDespesas: number;
  contasPagarEmAberto: number;
  contasReceberEmAberto: number;
  contasVencidas: number;
}

export interface FinancialReport {
  monthlyCashFlow: number;
  totalIncome: number;
  totalExpenses: number;
  balanceByBankAccount: Record<string, number>;
  openPayables: number;
  openReceivables: number;
  overdueBills: number;
  expenseSummaryByCategory: Record<string, number>;
  summaryByCostCenter: Record<string, number>;
}
