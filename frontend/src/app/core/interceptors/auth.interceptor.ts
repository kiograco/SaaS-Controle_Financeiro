import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSessionService);
  const authService = inject(AuthService);
  const accessToken = session.session()?.accessToken;
  const authReq = accessToken ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isRefreshRoute = req.url.includes('/auth/refresh');
      if (error.status === 401 && accessToken && !isRefreshRoute) {
        return authService.refreshToken().pipe(
          switchMap((newToken) => next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))),
          catchError((refreshError) => throwError(() => refreshError))
        );
      }
      return throwError(() => error);
    })
  );
};
