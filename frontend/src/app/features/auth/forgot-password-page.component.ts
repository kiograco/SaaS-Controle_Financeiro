import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <form class="auth-card card-surface" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Esqueci minha senha</h2>
      <p class="helper">Informe seu e-mail para receber as orientações de redefinição.</p>
      <mat-form-field appearance="outline"><mat-label>E-mail</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
      <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Enviar instruções</button>
      <a routerLink="/auth/login">Voltar para login</a>
    </form>
  `,
  styles: [`.auth-card { width: min(460px, 100%); padding: 2rem; display: grid; gap: 0.9rem; } .helper { margin: 0; color: var(--text-soft); } a { color: var(--primary-dark); text-decoration: none; font-weight: 700; }`]
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    this.authService.forgotPassword(this.form.getRawValue().email).subscribe(() => {
      this.toast.info('Solicitação registrada', 'Se o e-mail existir, as instruções serão enviadas.');
    });
  }
}
