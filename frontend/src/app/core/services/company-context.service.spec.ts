import { TestBed } from '@angular/core/testing';
import { CompanyContextService } from './company-context.service';
import { StorageService } from './storage.service';
import { CompanyMembership } from '../models/company.models';

describe('CompanyContextService', () => {
  let service: CompanyContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyContextService, StorageService]
    });
    service = TestBed.inject(CompanyContextService);
    service.clear();
  });

  it('deve selecionar a primeira empresa quando a empresa atual nao existir', () => {
    const memberships: CompanyMembership[] = [
      {
        id: 'membership-1',
        active: true,
        roles: ['COMPANY_ADMIN'],
        company: {
          id: 'company-1',
          legalName: 'Empresa Exemplo LTDA',
          tradeName: 'Empresa Exemplo',
          cnpj: '12.345.678/0001-90',
          active: true
        }
      }
    ];

    service.setMemberships(memberships);

    expect(service.selectedCompanyId()).toBe('company-1');
    expect(service.selectedMembership()?.company.tradeName).toBe('Empresa Exemplo');
  });
});
