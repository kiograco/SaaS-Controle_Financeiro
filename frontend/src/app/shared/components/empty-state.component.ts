import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-box">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'Nada para exibir por aqui';
  @Input() description = 'Quando houver dados disponíveis, eles aparecerão nesta área.';
}
