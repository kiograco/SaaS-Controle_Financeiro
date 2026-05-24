import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CompanyContextService } from '../../core/services/company-context.service';
import { CompanyService } from '../../core/services/company.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { FormErrorMessageComponent } from '../../shared/components/form-error-message.component';
import { cnpjValidator } from '../../shared/validators/br-validators';
import { CompanyMembership } from '../../core/models/company.models';

@Component({
  selector: 'app-company-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    FormErrorMessageComponent
  ],
  template: `
    <div class="page-shell">
      <app-page-header
        title="Cadastrar Empresa"
        subtitle="Crie a primeira empresa para começar a usar os módulos financeiros e de ponto."
        eyebrow="Empresa" />

      <section class="card-surface form-card">
        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="form-col-6">
            <mat-label>Razão social</mat-label>
            <input matInput formControlName="legalName" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-col-6">
            <mat-label>Nome fantasia</mat-label>
            <input matInput formControlName="tradeName" />
          </mat-form-field>

          <div class="form-col-6">
            <mat-form-field appearance="outline">
              <mat-label>CNPJ</mat-label>
              <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00" />
            </mat-form-field>
            <app-form-error-message [control]="form.controls.cnpj" message="Informe um CNPJ válido." />
          </div>

          <div class="form-col-12 actions">
            <button mat-stroked-button type="button" (click)="router.navigate(['/settings'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving">Criar empresa</button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .form-card { padding: 1.25rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }
  `]
})
export class CompanyCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);
  readonly router = inject(Router);

  saving = false;

  readonly form = this.fb.nonNullable.group({
    legalName: ['', Validators.required],
    tradeName: ['', Validators.required],
    cnpj: ['', [Validators.required, cnpjValidator()]]
  });

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.companyService.createCompany(this.form.getRawValue()).subscribe({
      next: (company) => {
        const createdMembership: CompanyMembership = {
          id: `local-${company.id}`,
          company,
          roles: ['COMPANY_ADMIN'],
          active: true
        };
        this.companyContext.upsertMembership(createdMembership);
        this.companyContext.selectCompany(company.id);

        this.companyService.getMemberships().subscribe({
          next: (memberships) => {
            if (memberships.length) {
              this.companyContext.setMemberships(memberships);
              this.companyContext.selectCompany(company.id);
            }
            this.toast.success('Empresa criada', 'A empresa foi cadastrada e selecionada com sucesso.');
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.toast.success('Empresa criada', 'A empresa foi cadastrada e selecionada com sucesso.');
            this.router.navigate(['/dashboard']);
          },
          complete: () => this.saving = false
        });
      },
      error: () => this.saving = false
    });
  }
}
