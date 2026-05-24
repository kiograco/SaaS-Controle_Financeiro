import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthlyTimeReport } from '../models/time-tracking.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TimeReportService extends ApiService {
  monthly(companyId: string, month: string): Observable<MonthlyTimeReport> {
    return this.http.get<MonthlyTimeReport>(`${this.baseUrl}/companies/${companyId}/time/reports/monthly`, {
      params: this.buildParams({ month })
    });
  }
}
