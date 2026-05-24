import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  protected buildParams(params?: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  protected getPage<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<PageResponse<T>> {
    return this.http.get<PageResponse<T>>(`${this.baseUrl}${path}`, { params: this.buildParams(params) });
  }
}
