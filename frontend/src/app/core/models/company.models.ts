export type AppRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'FINANCE_MANAGER'
  | 'FINANCE_VIEWER'
  | 'HR_MANAGER'
  | 'HR_VIEWER';

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  active: boolean;
}

export interface CompanyMembership {
  id: string;
  company: Company;
  roles: AppRole[];
  active: boolean;
}

export interface CompanyCreateRequest {
  legalName: string;
  tradeName: string;
  cnpj: string;
}
