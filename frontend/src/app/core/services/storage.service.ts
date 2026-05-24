import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = sessionStorage;

  set<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const raw = this.storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
