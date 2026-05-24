import { Injectable } from '@angular/core';
import { FinancialTransaction } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class TransactionService extends GenericCompanyResourceService<FinancialTransaction> {
  constructor() {
    super('transactions');
  }
}
