import { Injectable } from '@angular/core';
import { CostCenter } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class CostCenterService extends GenericCompanyResourceService<CostCenter> {
  constructor() {
    super('cost-centers');
  }
}
