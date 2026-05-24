import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBootstrapService } from './core/services/app-bootstrap.service';
import { ThemeService } from './core/services/theme.service';
import { LoadingOverlayComponent } from './shared/components/loading-overlay.component';
import { ToastOutletComponent } from './shared/components/toast-outlet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent, ToastOutletComponent],
  template: `
    <router-outlet />
    <app-loading-overlay />
    <app-toast-outlet />
  `
})
export class AppComponent {
  private readonly bootstrapService = inject(AppBootstrapService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.initialize();
    this.bootstrapService.initialize();
  }
}
