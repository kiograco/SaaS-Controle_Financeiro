import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-chip" [class.success]="tone==='success'" [class.warning]="tone==='warning'" [class.danger]="tone==='danger'">{{ label }}</span>`
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() tone: 'success' | 'warning' | 'danger' = 'success';
}
