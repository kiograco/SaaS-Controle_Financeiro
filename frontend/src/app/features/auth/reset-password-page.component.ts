import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <form class="auth-card card-surface" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Redefinir senha</h2>
      <p class="helper">Escolha uma nova senha para acessar sua conta.</p>
      <mat-form-field appearance="outline"><mat-label>Nova senha</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
      <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Atualizar senha</button>
      <a routerLink="/auth/login">Voltar para login</a>
    </form>
  `,
  styles: [`.auth-card { width: min(460px, 100%); padding: 2rem; display: grid; gap: 0.9rem; } .helper { margin: 0; color: var(--text-soft); } a { color: var(--primary-dark); text-decoration: none; font-weight: 700; }`]
})
export class ResetPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.authService.resetPassword(token, this.form.getRawValue().password).subscribe(() => {
      this.toast.success('Senha atualizada', 'Sua senha foi redefinida com sucesso.');
      this.router.navigate(['/auth/login']);
    });
  }
}
