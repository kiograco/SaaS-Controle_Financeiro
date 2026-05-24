import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/common.models';
import { TimeSheet } from '../models/time-tracking.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TimeSheetService extends ApiService {
  list(companyId: string, startDate: string, endDate: string, page = 0, size = 20): Observable<PageResponse<TimeSheet>> {
    return this.getPage<TimeSheet>(`/companies/${companyId}/time/sheets`, { startDate, endDate, page, size });
  }

  recalculate(companyId: string, payload: { employeeId: string; startDate: string; endDate: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/companies/${companyId}/time/sheets/recalculate`, payload);
  }
}
