import { AppRole } from './company.models';

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: AppRole[];
}
