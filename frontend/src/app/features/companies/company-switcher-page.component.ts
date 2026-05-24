import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CompanyContextService } from '../../core/services/company-context.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-company-switcher-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header
        title="Trocar Empresa"
        subtitle="Escolha em qual empresa você deseja trabalhar agora. Cada contexto mantém seus dados e permissões isolados."
        eyebrow="Multiempresa">
        <button mat-flat-button color="primary" routerLink="/company/create">Cadastrar empresa</button>
      </app-page-header>

      <app-empty-state
        *ngIf="!memberships().length"
        title="Nenhuma empresa disponível"
        description="Cadastre sua primeira empresa para começar a operar no sistema." />

      <section class="company-grid" *ngIf="memberships().length">
        <article class="card-surface company-card" *ngFor="let membership of memberships()" [class.active]="membership.company.id === currentCompanyId()">
          <div class="badge">
            <mat-icon>{{ membership.company.id === currentCompanyId() ? 'verified' : 'business' }}</mat-icon>
            <span>{{ membership.company.id === currentCompanyId() ? 'Empresa atual' : 'Disponível' }}</span>
          </div>

          <div class="company-main">
            <h3>{{ membership.company.tradeName }}</h3>
            <p>{{ membership.company.legalName }}</p>
          </div>

          <dl class="company-meta">
            <div>
              <dt>CNPJ</dt>
              <dd>{{ membership.company.cnpj }}</dd>
            </div>
            <div>
              <dt>Papéis</dt>
              <dd>{{ membership.roles.join(' • ') }}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{{ membership.company.active ? 'Ativa' : 'Inativa' }}</dd>
            </div>
          </dl>

          <div class="actions">
            <button
              mat-stroked-button
              type="button"
              [disabled]="membership.company.id === currentCompanyId()"
              (click)="selectCompany(membership.company.id)">
              {{ membership.company.id === currentCompanyId() ? 'Selecionada' : 'Usar esta empresa' }}
            </button>
          </div>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .company-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .company-card {
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
      border-width: 1px;
      transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    }
    .company-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    }
    .company-card.active {
      border-color: color-mix(in srgb, var(--primary) 60%, var(--border));
      box-shadow: 0 22px 40px rgba(14, 143, 115, 0.12);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary-dark);
      font-weight: 700;
    }
    .company-main p {
      margin: 0.35rem 0 0;
      color: var(--text-soft);
    }
    .company-meta {
      margin: 0;
      display: grid;
      gap: 0.85rem;
    }
    .company-meta div {
      display: grid;
      gap: 0.2rem;
    }
    dt {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-soft);
      font-weight: 700;
    }
    dd {
      margin: 0;
      color: var(--text);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    @media (max-width: 960px) {
      .company-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompanySwitcherPageComponent {
  readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly memberships = computed(() => this.companyContext.memberships());
  readonly currentCompanyId = computed(() => this.companyContext.selectedCompanyId());

  selectCompany(companyId: string): void {
    this.companyContext.selectCompany(companyId);
    const selected = this.companyContext.memberships().find((membership) => membership.company.id === companyId);
    this.toast.success('Empresa selecionada', `${selected?.company.tradeName ?? 'Empresa'} agora está ativa.`);
    this.router.navigate(['/dashboard']);
  }
}
