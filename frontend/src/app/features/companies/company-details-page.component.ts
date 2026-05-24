import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CompanyContextService } from '../../core/services/company-context.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-company-details-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Dados da Empresa" subtitle="Visualize o contexto atual da empresa selecionada." eyebrow="Empresa" />
      <section class="card-surface details" *ngIf="companyContext.selectedMembership() as membership">
        <h3>{{ membership.company.tradeName }}</h3>
        <p>Razão social: {{ membership.company.legalName }}</p>
        <p>CNPJ: {{ membership.company.cnpj }}</p>
        <p>Status: {{ membership.company.active ? 'Ativa' : 'Inativa' }}</p>
      </section>
    </div>
  `,
  styles: [`.details { padding: 1.25rem; }`]
})
export class CompanyDetailsPageComponent {
  readonly companyContext = inject(CompanyContextService);
}
