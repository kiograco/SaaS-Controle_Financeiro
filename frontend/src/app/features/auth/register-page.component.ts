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
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, FormErrorMessageComponent],
  template: `
    <form class="auth-card card-surface" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Criar conta</h2>
      <p class="helper">Cadastre seu acesso para começar.</p>
      <mat-form-field appearance="outline"><mat-label>Nome</mat-label><input matInput formControlName="name"></mat-form-field>
      <app-form-error-message [control]="form.controls.name" message="Informe seu nome." />
      <mat-form-field appearance="outline"><mat-label>E-mail</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
      <app-form-error-message [control]="form.controls.email" message="Informe um e-mail válido." />
      <mat-form-field appearance="outline"><mat-label>Senha</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
      <app-form-error-message [control]="form.controls.password" message="A senha deve ter pelo menos 8 caracteres." />
      <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Criar conta</button>
      <a routerLink="/auth/login">Já possuo acesso</a>
    </form>
  `,
  styles: [`.auth-card { width: min(460px, 100%); padding: 2rem; display: grid; gap: 0.9rem; } .helper { margin: 0; color: var(--text-soft); } a { color: var(--primary-dark); text-decoration: none; font-weight: 700; }`]
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        const target = this.companyContext.selectedCompanyId() ? '/dashboard' : '/settings';
        const message = this.companyContext.selectedCompanyId()
          ? 'Sua conta foi criada com sucesso.'
          : 'Sua conta foi criada. Agora vincule ou selecione uma empresa para começar.';
        this.toast.success('Cadastro realizado', message);
        this.router.navigate([target]);
      }
    });
  }
}
