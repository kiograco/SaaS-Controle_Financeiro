import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { CompanyContextService } from '../services/company-context.service';
import { AppRole } from '../models/company.models';

function canAccess(route: ActivatedRouteSnapshot): boolean {
  const context = inject(CompanyContextService);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as AppRole[] | undefined) ?? [];
  const membership = context.selectedMembership();
  if (!membership) {
    return false;
  }
  if (membership.roles.some((role) => role === 'SUPER_ADMIN' || requiredRoles.includes(role))) {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
}

export const roleGuard: CanActivateFn = (route) => canAccess(route);
