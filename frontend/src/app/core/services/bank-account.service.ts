import { Injectable } from '@angular/core';
import { BankAccount } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class BankAccountService extends GenericCompanyResourceService<BankAccount> {
  constructor() {
    super('bank-accounts');
  }
}
