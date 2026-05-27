import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { companySelectedGuard } from './company-selected.guard';
import { CompanyContextService } from '../services/company-context.service';
import { StorageService } from '../services/storage.service';

describe('companySelectedGuard', () => {
  let companyContext: CompanyContextService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyContextService, StorageService, provideRouter([])]
    });
    companyContext = TestBed.inject(CompanyContextService);
    router = TestBed.inject(Router);
    spyOn(router, 'createUrlTree').and.callThrough();
    companyContext.clear();
  });

  it('deve permitir acesso quando houver empresa selecionada', () => {
    companyContext.selectCompany('company-1');

    const result = TestBed.runInInjectionContext(() => companySelectedGuard({} as never, {} as never));

    expect(result).toBeTrue();
  });

  it('deve redirecionar para selecao de empresa quando nao houver empresa', () => {
    const result = TestBed.runInInjectionContext(() => companySelectedGuard({} as never, {} as never));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/company/select']);
  });
});
