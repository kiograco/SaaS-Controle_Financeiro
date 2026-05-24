import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ThemeService } from '../../core/services/theme.service';
import { CompanyContextService } from '../../core/services/company-context.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="page-shell">
      <app-page-header title="Configurações" subtitle="Preferências visuais e ajustes gerais da aplicação." eyebrow="Sistema" />
      <section class="card-surface settings" *ngIf="!companyContext.memberships().length">
        <h3>Nenhuma empresa vinculada</h3>
        <p>Seu usuário já está autenticado, mas ainda não possui uma empresa para operar no sistema.</p>
        <button mat-flat-button color="primary" routerLink="/company/create">Cadastrar empresa</button>
      </section>
      <section class="card-surface settings" *ngIf="companyContext.memberships().length">
        <h3>Empresa ativa</h3>
        <p *ngIf="companyContext.selectedMembership() as membership">
          Você está operando na empresa <strong>{{ membership.company.tradeName }}</strong>.
        </p>
        <p *ngIf="!companyContext.selectedMembership()">
          Selecione uma empresa para continuar usando os módulos de negócio.
        </p>
        <div class="actions">
          <button mat-stroked-button routerLink="/company/select">Trocar empresa</button>
          <button mat-flat-button color="primary" routerLink="/company/create">Cadastrar nova empresa</button>
        </div>
      </section>
      <section class="card-surface settings">
        <h3>Tema</h3>
        <p>Alterne entre modo claro e escuro para adaptar o ambiente ao seu contexto.</p>
        <button mat-flat-button color="primary" (click)="theme.toggle()">{{ theme.darkMode() ? 'Usar modo claro' : 'Usar modo escuro' }}</button>
      </section>
    </div>
  `,
  styles: [`
    .settings { padding: 1.25rem; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
  `]
})
export class SettingsPageComponent {
  readonly theme = inject(ThemeService);
  readonly companyContext = inject(CompanyContextService);
}
