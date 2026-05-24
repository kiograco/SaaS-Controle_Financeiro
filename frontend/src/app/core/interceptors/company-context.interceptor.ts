import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CompanyContextService } from '../services/company-context.service';

export const companyContextInterceptor: HttpInterceptorFn = (req, next) => {
  const context = inject(CompanyContextService);
  const companyId = context.selectedCompanyId();
  const isProtectedApi = req.url.includes('/api/v1/companies/');

  if (companyId && isProtectedApi) {
    req = req.clone({ setHeaders: { 'X-Company-Id': companyId } });
  }

  return next(req);
};
