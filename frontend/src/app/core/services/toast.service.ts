import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private counter = 0;

  success(title: string, message: string): void {
    this.push('success', title, message);
  }

  error(title: string, message: string): void {
    this.push('error', title, message);
  }

  info(title: string, message: string): void {
    this.push('info', title, message);
  }

  dismiss(id: number): void {
    this.messages.update((current) => current.filter((item) => item.id !== id));
  }

  private push(type: ToastMessage['type'], title: string, message: string): void {
    const id = ++this.counter;
    this.messages.update((current) => [...current, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
