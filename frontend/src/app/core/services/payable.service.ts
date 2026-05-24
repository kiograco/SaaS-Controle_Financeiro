import { Injectable } from '@angular/core';
import { Payable } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class PayableService extends GenericCompanyResourceService<Payable> {
  constructor() {
    super('payables');
  }
}
