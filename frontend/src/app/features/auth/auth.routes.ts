import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      { path: 'login', loadComponent: () => import('./login-page.component').then((m) => m.LoginPageComponent) },
      { path: 'register', loadComponent: () => import('./register-page.component').then((m) => m.RegisterPageComponent) },
      { path: 'forgot-password', loadComponent: () => import('./forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent) },
      { path: 'reset-password', loadComponent: () => import('./reset-password-page.component').then((m) => m.ResetPasswordPageComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  }
];
