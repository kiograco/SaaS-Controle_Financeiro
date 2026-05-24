import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PageResponse } from '../models/common.models';

export abstract class GenericCompanyResourceService<T> extends ApiService {
  constructor(private readonly endpoint: string) {
    super();
  }

  list(companyId: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<PageResponse<T>> {
    return this.getPage<T>(`/companies/${companyId}/${this.endpoint}`, params);
  }

  get(companyId: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/companies/${companyId}/${this.endpoint}/${id}`);
  }

  create(companyId: string, payload: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/companies/${companyId}/${this.endpoint}`, payload);
  }

  update(companyId: string, id: string, payload: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/companies/${companyId}/${this.endpoint}/${id}`, payload);
  }

  remove(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/companies/${companyId}/${this.endpoint}/${id}`);
  }
}
