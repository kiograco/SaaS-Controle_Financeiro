import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(false);

  constructor(private readonly storage: StorageService) {}

  initialize(): void {
    const stored = this.storage.get<boolean>('theme.darkMode');
    this.darkMode.set(Boolean(stored));
    this.apply();
  }

  toggle(): void {
    this.darkMode.update((value) => !value);
    this.storage.set('theme.darkMode', this.darkMode());
    this.apply();
  }

  private apply(): void {
    document.body.classList.toggle('dark-theme', this.darkMode());
  }
}
