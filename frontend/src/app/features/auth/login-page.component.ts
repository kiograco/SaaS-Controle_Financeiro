import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { ToastService } from '../../core/services/toast.service';
import { FormErrorMessageComponent } from '../../shared/components/form-error-message.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, FormErrorMessageComponent],
  template: `
    <form class="auth-card card-surface" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Entrar</h2>
      <p class="helper">Acesse sua conta para continuar.</p>
      <mat-form-field appearance="outline">
        <mat-label>E-mail</mat-label>
        <input matInput formControlName="email" type="email">
      </mat-form-field>
      <app-form-error-message [control]="form.controls.email" message="Informe um e-mail válido." />
      <mat-form-field appearance="outline">
        <mat-label>Senha</mat-label>
        <input matInput formControlName="password" type="password">
      </mat-form-field>
      <app-form-error-message [control]="form.controls.password" message="Informe sua senha." />
      <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Entrar</button>
      <div class="links">
        <a routerLink="/auth/forgot-password">Esqueci minha senha</a>
        <a routerLink="/auth/register">Criar conta</a>
      </div>
    </form>
  `,
  styles: [`
    .auth-card { width: min(460px, 100%); padding: 2rem; display: grid; gap: 0.9rem; }
    .helper { margin: 0 0 0.5rem; color: var(--text-soft); }
    .links { display: flex; justify-content: space-between; gap: 1rem; }
    a { color: var(--primary-dark); text-decoration: none; font-weight: 700; }
  `]
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const target = this.companyContext.selectedCompanyId() ? '/dashboard' : '/settings';
        const message = this.companyContext.selectedCompanyId()
          ? 'Bem-vindo de volta à plataforma.'
          : 'Sua conta foi autenticada. Agora selecione uma empresa para continuar.';
        this.toast.success('Login realizado', message);
        this.router.navigate([target]);
      }
    });
  }
}
