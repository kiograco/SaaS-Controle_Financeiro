import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <small class="error" *ngIf="control?.invalid && (control?.dirty || control?.touched)">
      {{ message }}
    </small>
  `,
  styles: [`.error { color: var(--danger); display: block; margin-top: 0.2rem; }`]
})
export class FormErrorMessageComponent {
  @Input() control: AbstractControl | null = null;
  @Input() message = 'Campo inválido.';
}
