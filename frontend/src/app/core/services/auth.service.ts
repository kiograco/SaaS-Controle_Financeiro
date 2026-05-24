import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from '../models/auth.models';
import { AuthSessionService } from './auth-session.service';
import { CompanyService } from './company.service';
import { CompanyContextService } from './company-context.service';

@Injectable({ providedIn: 'root' })
export class AuthService extends ApiService {
  private readonly session = inject(AuthSessionService);
  private readonly companyService = inject(CompanyService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly router = inject(Router);
  private refreshRequest$: Observable<string> | null = null;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      switchMap((response) => this.handleAuthSuccess(response))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      switchMap((response) => this.handleAuthSuccess(response))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return of(void 0);
  }

  resetPassword(token: string, password: string): Observable<void> {
    return of(void 0);
  }

  refreshToken(): Observable<string> {
    const current = this.session.session();
    if (!current?.refreshToken) {
      return throwError(() => new Error('Sessao invalida.'));
    }
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }
    const payload: RefreshTokenRequest = { refreshToken: current.refreshToken };
    this.refreshRequest$ = this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, payload).pipe(
      tap((response) => this.session.setSession(response)),
      map((response) => response.accessToken),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      }),
      finalize(() => this.refreshRequest$ = null),
      shareReplay(1)
    );
    return this.refreshRequest$;
  }

  logout(): void {
    this.session.clear();
    this.companyContext.clear();
    this.router.navigate(['/auth/login']);
  }

  private handleAuthSuccess(response: AuthResponse): Observable<AuthResponse> {
    this.session.setSession(response);
    return this.companyService.getMemberships().pipe(
      tap((memberships) => this.companyContext.setMemberships(memberships)),
      map(() => response)
    );
  }
}
