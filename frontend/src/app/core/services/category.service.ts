import { Injectable } from '@angular/core';
import { Category } from '../models/finance.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class CategoryService extends GenericCompanyResourceService<Category> {
  constructor() {
    super('categories');
  }
}
