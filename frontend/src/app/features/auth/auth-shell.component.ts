import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="auth-shell">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Plataforma SaaS</p>
          <h1>Controle financeiro e gestão de ponto em um único painel.</h1>
          <p>Gerencie múltiplas empresas, acompanhe fluxo de caixa, organize jornadas e importe registros de ponto com segurança.</p>
          <ul>
            <li>Isolamento completo por empresa</li>
            <li>Dashboard executivo com indicadores</li>
            <li>Importação CSV com preview e validação</li>
          </ul>
        </div>
      </section>
      <section class="form-side">
        <a class="brand" routerLink="/auth/login">Finance SaaS</a>
        <router-outlet />
      </section>
    </div>
  `,
  styles: [`
    .auth-shell { min-height: 100vh; display: grid; grid-template-columns: 1.15fr 0.85fr; }
    .hero {
      padding: 4rem;
      background:
        radial-gradient(circle at 15% 15%, rgba(43, 200, 163, 0.45), transparent 28%),
        linear-gradient(145deg, #082128, #103943 56%, #0e8f73);
      color: white;
      display: grid;
      align-items: center;
    }
    .hero-copy { max-width: 620px; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; }
    h1 { font-size: clamp(2.5rem, 4vw, 4.5rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    p, li { font-size: 1.1rem; color: rgba(255,255,255,0.84); }
    ul { padding-left: 1.15rem; display: grid; gap: 0.4rem; }
    .form-side {
      display: grid;
      align-content: center;
      justify-items: center;
      padding: 2rem;
      background: var(--bg);
    }
    .brand {
      margin-bottom: 1.5rem;
      color: var(--primary-dark);
      text-decoration: none;
      font-family: 'Manrope', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
    }
    @media (max-width: 980px) {
      .auth-shell { grid-template-columns: 1fr; }
      .hero { padding: 2rem; }
    }
  `]
})
export class AuthShellComponent {}
