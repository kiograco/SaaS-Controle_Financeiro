import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkSchedule } from '../models/time-tracking.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class WorkScheduleService extends GenericCompanyResourceService<WorkSchedule> {
  constructor() {
    super('work-schedules');
  }

  assign(companyId: string, payload: { employeeId: string; workScheduleId: string; startDate: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/companies/${companyId}/work-schedules/assignments`, payload);
  }
}
