import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/common.models';
import {
  TimeImportBatch,
  TimeImportConfirmResponse,
  TimeImportError,
  TimeImportPreviewResponse
} from '../models/time-tracking.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TimeImportService extends ApiService {
  preview(companyId: string, file: File, createMissingEmployees: boolean): Observable<TimeImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<TimeImportPreviewResponse>(`${this.baseUrl}/companies/${companyId}/time/imports/preview`, formData, {
      params: this.buildParams({ createMissingEmployees })
    });
  }

  confirm(companyId: string, file: File, createMissingEmployees: boolean): Observable<TimeImportConfirmResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<TimeImportConfirmResponse>(`${this.baseUrl}/companies/${companyId}/time/imports/confirm`, formData, {
      params: this.buildParams({ createMissingEmployees })
    });
  }

  list(companyId: string, page = 0, size = 20): Observable<PageResponse<TimeImportBatch>> {
    return this.getPage<TimeImportBatch>(`/companies/${companyId}/time/imports`, { page, size });
  }

  errors(companyId: string, batchId: string): Observable<TimeImportError[]> {
    return this.http.get<TimeImportError[]>(`${this.baseUrl}/companies/${companyId}/time/imports/${batchId}/errors`);
  }

  delete(companyId: string, batchId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/companies/${companyId}/time/imports/${batchId}`);
  }
}
