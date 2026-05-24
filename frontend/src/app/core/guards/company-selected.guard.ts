import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CompanyContextService } from '../services/company-context.service';

export const companySelectedGuard: CanActivateFn = () => {
  const context = inject(CompanyContextService);
  const router = inject(Router);
  return context.selectedCompanyId() ? true : router.createUrlTree(['/company/select']);
};
