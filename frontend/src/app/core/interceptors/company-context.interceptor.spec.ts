import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { companyContextInterceptor } from './company-context.interceptor';
import { CompanyContextService } from '../services/company-context.service';
import { StorageService } from '../services/storage.service';

describe('companyContextInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let companyContext: CompanyContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CompanyContextService,
        StorageService,
        provideHttpClient(withInterceptors([companyContextInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    companyContext = TestBed.inject(CompanyContextService);
    companyContext.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar X-Company-Id nas rotas protegidas', () => {
    companyContext.selectCompany('company-123');

    http.get('http://localhost:8080/api/v1/companies/company-123/categories').subscribe();

    const request = httpMock.expectOne('http://localhost:8080/api/v1/companies/company-123/categories');
    expect(request.request.headers.get('X-Company-Id')).toBe('company-123');
    request.flush([]);
  });

  it('nao deve adicionar X-Company-Id fora das rotas protegidas', () => {
    companyContext.selectCompany('company-123');

    http.get('http://localhost:8080/api/v1/auth/login').subscribe();

    const request = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(request.request.headers.has('X-Company-Id')).toBeFalse();
    request.flush({});
  });
});
