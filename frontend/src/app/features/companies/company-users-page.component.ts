import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { UserService } from '../../core/services/user.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { CompanyUser } from '../../core/models/user.models';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-company-users-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Usuários e Permissões" subtitle="Gerencie acessos, perfis e papéis por empresa." eyebrow="Empresa" />
      <app-empty-state *ngIf="!companyContext.selectedCompanyId()" title="Selecione uma empresa" description="Escolha a empresa no topo para visualizar seus usuários." />
      <app-empty-state *ngIf="companyContext.selectedCompanyId() && !users().length" title="Nenhum usuário encontrado" description="Convide usuários para começar a gerenciar permissões." />
      <section class="card-surface details" *ngIf="users().length">
        <article class="user-row" *ngFor="let user of users()">
          <div>
            <strong>{{ user.name }}</strong>
            <p>{{ user.email }}</p>
          </div>
          <div class="meta">
            <span>{{ user.active ? 'Ativo' : 'Inativo' }}</span>
            <small>{{ user.roles.join(' • ') }}</small>
          </div>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .details { padding: 1.25rem; display: grid; gap: 0.85rem; }
    .user-row {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 0.9rem 0; border-bottom: 1px solid var(--border);
    }
    .user-row:last-child { border-bottom: 0; padding-bottom: 0; }
    .user-row p, .meta small { margin: 0.2rem 0 0; color: var(--text-soft); }
    .meta { text-align: right; }
    @media (max-width: 700px) {
      .user-row { flex-direction: column; align-items: flex-start; }
      .meta { text-align: left; }
    }
  `]
})
export class CompanyUsersPageComponent {
  readonly companyContext = inject(CompanyContextService);
  private readonly userService = inject(UserService);
  readonly users = signal<CompanyUser[]>([]);

  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (!companyId) {
        this.users.set([]);
        return;
      }
      this.userService.listByCompany(companyId).subscribe((users) => this.users.set(users));
    }, { allowSignalWrites: true });
  }
}
