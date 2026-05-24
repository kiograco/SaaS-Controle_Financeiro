import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Company, CompanyCreateRequest, CompanyMembership } from '../models/company.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CompanyService extends ApiService {
  getMemberships(): Observable<CompanyMembership[]> {
    return this.http.get<CompanyMembership[]>(`${this.baseUrl}/users/me/memberships`).pipe(
      catchError(() => of([]))
    );
  }

  getCompanyDetails(companyId: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/companies/${companyId}`);
  }

  createCompany(payload: CompanyCreateRequest): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, payload);
  }
}
