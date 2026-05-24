import { Injectable, computed, signal } from '@angular/core';
import { AuthResponse } from '../models/auth.models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly authState = signal<AuthResponse | null>(this.storage.get<AuthResponse>('auth.session'));
  readonly session = computed(() => this.authState());
  readonly isAuthenticated = computed(() => Boolean(this.authState()?.accessToken));

  constructor(private readonly storage: StorageService) {}

  setSession(session: AuthResponse): void {
    this.authState.set(session);
    this.storage.set('auth.session', session);
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    const current = this.authState();
    if (!current) {
      return;
    }
    this.setSession({ ...current, accessToken, refreshToken });
  }

  clear(): void {
    this.authState.set(null);
    this.storage.remove('auth.session');
  }
}
