import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { CompanyUser } from '../models/user.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  listByCompany(companyId: string): Observable<CompanyUser[]> {
    return this.http.get<CompanyUser[]>(`${this.baseUrl}/companies/${companyId}/users`).pipe(
      catchError(() => of([]))
    );
  }
}
