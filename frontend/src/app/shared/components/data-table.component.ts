import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DataColumn<T> {
  key: string;
  label: string;
  cell: (row: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="table-shell card-surface">
      <table>
        <thead>
          <tr>
            <th *ngFor="let column of columns">{{ column.label }}</th>
            <th *ngIf="showActions">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows">
            <td *ngFor="let column of columns">{{ column.cell(row) }}</td>
            <td *ngIf="showActions" class="actions">
              <button mat-icon-button type="button" (click)="edit.emit(row)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button type="button" (click)="remove.emit(row)" aria-label="Excluir"><mat-icon>delete</mat-icon></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-shell { overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.95rem 1rem; border-bottom: 1px solid var(--border); text-align: left; }
    thead th { font-family: 'Manrope', sans-serif; color: var(--text-soft); font-size: 0.85rem; }
    .actions { white-space: nowrap; }
  `]
})
export class DataTableComponent<T> {
  @Input({ required: true }) columns: DataColumn<T>[] = [];
  @Input({ required: true }) rows: T[] = [];
  @Input() showActions = true;
  @Output() edit = new EventEmitter<T>();
  @Output() remove = new EventEmitter<T>();
}
