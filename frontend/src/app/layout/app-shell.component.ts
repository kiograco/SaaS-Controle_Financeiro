import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CompanyContextService } from '../core/services/company-context.service';
import { AuthSessionService } from '../core/services/auth-session.service';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { AppRole } from '../core/models/company.models';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles?: AppRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.open]="mobileOpen()">
        <div class="brand">
          <div class="brand-mark">F</div>
          <div>
            <strong>Finance SaaS</strong>
            <p>Gestão multiempresa</p>
          </div>
        </div>

        <nav class="menu">
          <ng-container *ngFor="let item of visibleMenu()">
            <a *ngIf="item.route" [routerLink]="item.route" routerLinkActive="active">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
            <section *ngIf="item.children">
              <p class="group-title">{{ item.label }}</p>
              <a *ngFor="let child of item.children" [routerLink]="child.route" routerLinkActive="active">
                <mat-icon>{{ child.icon }}</mat-icon>
                <span>{{ child.label }}</span>
              </a>
            </section>
          </ng-container>
        </nav>
      </aside>

      <div class="content">
        <header class="topbar card-surface">
          <button mat-icon-button type="button" class="mobile-trigger" (click)="toggleMobileMenu()">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-company" *ngIf="companyContext.selectedMembership() as membership">
            <strong>{{ membership.company.tradeName }}</strong>
            <span>Empresa ativa</span>
          </div>
          <div class="topbar-actions">
            <button mat-icon-button type="button" (click)="theme.toggle()"><mat-icon>{{ theme.darkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon></button>
            <button mat-icon-button type="button"><mat-icon>notifications</mat-icon></button>
            <button mat-stroked-button [matMenuTriggerFor]="menu">{{ session.session()?.name ?? 'Conta' }}</button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item routerLink="/settings">Configurações</button>
              <button mat-menu-item (click)="auth.logout()">Sair</button>
            </mat-menu>
          </div>
        </header>

        <main class="page-shell">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; display: grid; grid-template-columns: 290px 1fr; }
    .sidebar {
      background:
        radial-gradient(circle at top, rgba(55, 200, 164, 0.15), transparent 35%),
        linear-gradient(180deg, var(--sidebar), color-mix(in srgb, var(--sidebar) 85%, #12313a));
      color: var(--sidebar-text);
      padding: 1.2rem;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
    }
    .brand { display: flex; gap: 0.9rem; align-items: center; padding: 0.75rem; }
    .brand-mark {
      width: 48px; height: 48px; border-radius: 16px;
      display: grid; place-items: center; font-weight: 800;
      background: linear-gradient(135deg, #2bc8a3, #108f73);
      color: white;
    }
    .brand p { margin: 0.2rem 0 0; color: rgba(237, 247, 246, 0.72); }
    .menu { display: grid; gap: 1.4rem; margin-top: 1.25rem; }
    .menu a {
      color: var(--sidebar-text); text-decoration: none; display: flex; gap: 0.8rem;
      align-items: center; padding: 0.8rem 0.9rem; border-radius: 16px;
    }
    .menu a.active, .menu a:hover { background: rgba(255, 255, 255, 0.08); }
    .group-title {
      margin: 0 0 0.5rem; padding: 0 0.9rem;
      color: rgba(237, 247, 246, 0.65); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em;
    }
    .content { padding: 1rem; display: grid; gap: 1rem; }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.8rem 1rem; gap: 1rem; position: sticky; top: 1rem; z-index: 20;
    }
    .topbar-company {
      display: grid;
      gap: 0.15rem;
    }
    .topbar-company span {
      font-size: 0.82rem;
      color: var(--text-soft);
    }
    .topbar-actions { display: flex; align-items: center; gap: 0.35rem; }
    .mobile-trigger { display: none; }
    @media (max-width: 1024px) {
      .shell { grid-template-columns: 1fr; }
      .sidebar {
        position: fixed; left: 0; top: 0; bottom: 0; width: 280px; z-index: 30; transform: translateX(-100%);
        transition: transform 0.2s ease;
      }
      .sidebar.open { transform: translateX(0); }
      .mobile-trigger { display: inline-flex; }
    }
    @media (max-width: 720px) {
      .topbar { flex-wrap: wrap; }
      .topbar-company { width: 100%; }
    }
  `]
})
export class AppShellComponent {
  readonly companyContext = inject(CompanyContextService);
  readonly session = inject(AuthSessionService);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly mobileOpen = signal(false);

  readonly menu = signal<MenuItem[]>([
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    {
      label: 'Gestão Financeira',
      icon: 'paid',
      children: [
        { label: 'Contas a Pagar', icon: 'payments', route: '/finance/payables', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Contas a Receber', icon: 'request_quote', route: '/finance/receivables', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Transações', icon: 'swap_horiz', route: '/finance/transactions', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Contas Bancárias', icon: 'account_balance', route: '/finance/bank-accounts', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Categorias', icon: 'sell', route: '/finance/categories', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Centros de Custo', icon: 'hub', route: '/finance/cost-centers', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
        { label: 'Relatórios', icon: 'bar_chart', route: '/finance/reports', roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] }
      ]
    },
    {
      label: 'Gestão de Ponto',
      icon: 'schedule',
      children: [
        { label: 'Funcionários', icon: 'badge', route: '/time-tracking/employees', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
        { label: 'Jornadas', icon: 'calendar_month', route: '/time-tracking/work-schedules', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
        { label: 'Registros de Ponto', icon: 'fingerprint', route: '/time-tracking/time-entries', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
        { label: 'Importação CSV', icon: 'upload_file', route: '/time-tracking/imports', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
        { label: 'Espelhos de Ponto', icon: 'table_view', route: '/time-tracking/timesheets', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
        { label: 'Relatórios de Ponto', icon: 'monitoring', route: '/time-tracking/reports', roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] }
      ]
    },
    {
      label: 'Empresa',
      icon: 'business',
      children: [
        { label: 'Trocar Empresa', icon: 'sync_alt', route: '/company/select' },
        { label: 'Cadastrar Empresa', icon: 'add_business', route: '/company/create' },
        { label: 'Dados da Empresa', icon: 'apartment', route: '/company/details', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
        { label: 'Usuários e Permissões', icon: 'groups', route: '/company/users', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] }
      ]
    },
    { label: 'Configurações', icon: 'settings', route: '/settings' }
  ]);

  readonly visibleMenu = computed(() => {
    const roles = this.companyContext.selectedMembership()?.roles ?? [];
    return this.menu().map((item) => ({
      ...item,
      children: item.children?.filter((child) => !child.roles?.length || child.roles.some((role) => roles.includes(role) || roles.includes('SUPER_ADMIN')))
    })).filter((item) => item.route || item.children?.length);
  });

  toggleMobileMenu(): void {
    this.mobileOpen.update((current) => !current);
  }
}
