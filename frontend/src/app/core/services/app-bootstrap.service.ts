import { Injectable, inject } from '@angular/core';
import { AuthSessionService } from './auth-session.service';
import { CompanyContextService } from './company-context.service';
import { CompanyService } from './company.service';

@Injectable({ providedIn: 'root' })
export class AppBootstrapService {
  private readonly authSession = inject(AuthSessionService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly companyService = inject(CompanyService);

  initialize(): void {
    if (!this.authSession.isAuthenticated()) {
      return;
    }

    this.companyService.getMemberships().subscribe({
      next: (memberships) => {
        if (memberships.length) {
          this.companyContext.setMemberships(memberships);
        }
      }
    });
  }
}
