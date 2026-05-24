import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar o dashboard financeiro com o mes informado', () => {
    service.getDashboard('company-1', '2026-05').subscribe();

    const request = httpMock.expectOne((req) =>
      req.url === 'http://localhost:8080/api/v1/companies/company-1/dashboard' &&
      req.params.get('month') === '2026-05'
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      totalReceitas: 0,
      totalDespesas: 0,
      fluxoCaixaMensal: 0,
      contasPagarEmAberto: 0,
      contasReceberEmAberto: 0,
      contasVencidas: 0
    });
  });
});
