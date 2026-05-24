import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/common.models';
import { TimeEntry } from '../models/time-tracking.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class TimeEntryService extends GenericCompanyResourceService<TimeEntry> {
  constructor() {
    super('time/entries');
  }

  override list(companyId: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<PageResponse<TimeEntry>> {
    return super.list(companyId, {
      startDate: '2000-01-01',
      endDate: '2100-12-31',
      ...params
    });
  }
}
