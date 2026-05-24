import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { companySelectedGuard } from './core/guards/company-selected.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'finance',
        canActivate: [companySelectedGuard],
        children: [
          {
            path: 'categories',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/categories/categories-page.component').then((m) => m.CategoriesPageComponent)
          },
          {
            path: 'cost-centers',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/cost-centers/cost-centers-page.component').then((m) => m.CostCentersPageComponent)
          },
          {
            path: 'bank-accounts',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/bank-accounts/bank-accounts-page.component').then((m) => m.BankAccountsPageComponent)
          },
          {
            path: 'payables',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/payables/payables-page.component').then((m) => m.PayablesPageComponent)
          },
          {
            path: 'receivables',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/receivables/receivables-page.component').then((m) => m.ReceivablesPageComponent)
          },
          {
            path: 'transactions',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/transactions/transactions-page.component').then((m) => m.TransactionsPageComponent)
          },
          {
            path: 'reports',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'FINANCE_VIEWER'] },
            loadComponent: () => import('./features/finance/reports/finance-reports-page.component').then((m) => m.FinanceReportsPageComponent)
          }
        ]
      },
      {
        path: 'time-tracking',
        canActivate: [companySelectedGuard],
        children: [
          {
            path: 'employees',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/employees/employees-page.component').then((m) => m.EmployeesPageComponent)
          },
          {
            path: 'work-schedules',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/work-schedules/work-schedules-page.component').then((m) => m.WorkSchedulesPageComponent)
          },
          {
            path: 'time-entries',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/time-entries/time-entries-page.component').then((m) => m.TimeEntriesPageComponent)
          },
          {
            path: 'imports',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/imports/imports-page.component').then((m) => m.ImportsPageComponent)
          },
          {
            path: 'timesheets',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/timesheets/timesheets-page.component').then((m) => m.TimesheetsPageComponent)
          },
          {
            path: 'reports',
            canActivate: [roleGuard],
            data: { roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_VIEWER'] },
            loadComponent: () => import('./features/time-tracking/reports/time-reports-page.component').then((m) => m.TimeReportsPageComponent)
          }
        ]
      },
      {
        path: 'company',
        children: [
          {
            path: 'select',
            loadComponent: () => import('./features/companies/company-switcher-page.component').then((m) => m.CompanySwitcherPageComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/companies/company-create-page.component').then((m) => m.CompanyCreatePageComponent)
          },
          {
            path: 'details',
            canActivate: [companySelectedGuard, roleGuard],
            data: { roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
            loadComponent: () => import('./features/companies/company-details-page.component').then((m) => m.CompanyDetailsPageComponent)
          },
          {
            path: 'users',
            canActivate: [companySelectedGuard, roleGuard],
            data: { roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
            loadComponent: () => import('./features/companies/company-users-page.component').then((m) => m.CompanyUsersPageComponent)
          }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
