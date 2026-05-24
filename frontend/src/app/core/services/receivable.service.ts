import { Injectable } from '@angular/core';
import { Receivable } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class ReceivableService extends GenericCompanyResourceService<Receivable> {
  constructor() {
    super('receivables');
  }
}
