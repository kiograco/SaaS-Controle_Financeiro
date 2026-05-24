import { Injectable } from '@angular/core';
import { Employee } from '../models/time-tracking.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends GenericCompanyResourceService<Employee> {
  constructor() {
    super('employees');
  }
}
