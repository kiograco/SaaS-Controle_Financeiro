import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { companyContextInterceptor } from './core/interceptors/company-context.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      loadingInterceptor,
      authInterceptor,
      companyContextInterceptor,
      errorInterceptor
    ])),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
};
