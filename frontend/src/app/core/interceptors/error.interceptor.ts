import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      const isRefreshRequest = req.url.includes('/auth/refresh');
      if (error.status === 401 && isRefreshRequest) {
        toast.error('Sessao expirada', 'Sua sessao expirou. Faça login novamente.');
        authService.logout();
      } else if (error.status === 401 && isAuthRequest) {
        const message = error.error?.message ?? 'Não foi possível autenticar com os dados informados.';
        toast.error('Falha na autenticação', message);
      } else if (error.status === 401) {
        toast.error('Sessao indisponível', 'Não foi possível validar sua sessão agora. Tente novamente em instantes.');
      } else if (error.status === 403) {
        toast.error('Acesso negado', 'Você não possui permissão para acessar este recurso.');
      } else if (error.status >= 400) {
        const message = error.error?.message ?? 'Não foi possível concluir a operação.';
        toast.error('Erro', message);
      }
      return throwError(() => error);
    })
  );
};
