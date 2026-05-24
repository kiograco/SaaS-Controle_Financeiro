import { Injectable, computed, signal } from '@angular/core';
import { CompanyMembership } from '../models/company.models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  private readonly membershipsState = signal<CompanyMembership[]>(this.storage.get<CompanyMembership[]>('company.memberships') ?? []);
  private readonly selectedCompanyIdState = signal<string | null>(this.storage.get<string>('company.selectedId'));

  readonly memberships = computed(() => this.membershipsState());
  readonly selectedCompanyId = computed(() => this.selectedCompanyIdState());
  readonly selectedMembership = computed(() =>
    this.membershipsState().find((membership) => membership.company.id === this.selectedCompanyIdState()) ?? null
  );

  constructor(private readonly storage: StorageService) {}

  setMemberships(memberships: CompanyMembership[]): void {
    this.membershipsState.set(memberships);
    this.storage.set('company.memberships', memberships);
    if (!memberships.some((membership) => membership.company.id === this.selectedCompanyIdState())) {
      this.selectCompany(memberships[0]?.company.id ?? null);
    }
  }

  upsertMembership(membership: CompanyMembership): void {
    const current = this.membershipsState();
    const index = current.findIndex((item) => item.company.id === membership.company.id);
    if (index >= 0) {
      const updated = [...current];
      updated[index] = membership;
      this.membershipsState.set(updated);
      this.storage.set('company.memberships', updated);
    } else {
      const updated = [...current, membership];
      this.membershipsState.set(updated);
      this.storage.set('company.memberships', updated);
    }
  }

  selectCompany(companyId: string | null): void {
    this.selectedCompanyIdState.set(companyId);
    if (companyId) {
      this.storage.set('company.selectedId', companyId);
    } else {
      this.storage.remove('company.selectedId');
    }
  }

  clear(): void {
    this.membershipsState.set([]);
    this.storage.remove('company.memberships');
    this.selectCompany(null);
  }
}
