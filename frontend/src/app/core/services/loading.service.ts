import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly loading = signal(false);

  show(): void {
    this.activeRequests.update((value) => value + 1);
    this.loading.set(true);
  }

  hide(): void {
    this.activeRequests.update((value) => Math.max(value - 1, 0));
    this.loading.set(this.activeRequests() > 0);
  }
}
