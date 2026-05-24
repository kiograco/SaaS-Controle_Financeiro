import { Component, inject } from '@angular/core';
import { ResourcePageComponent, ResourcePageConfig } from '../../../shared/components/resource-page.component';
import { Category } from '../../../core/models/finance.models';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [ResourcePageComponent],
  template: `<app-resource-page [config]="config" />`
})
export class CategoriesPageComponent {
  private readonly service = inject(CategoryService);
  readonly config: ResourcePageConfig<Category> = {
    title: 'Categorias',
    subtitle: 'Organize receitas e despesas por grupos padronizados.',
    eyebrow: 'Gestão Financeira',
    emptyTitle: 'Nenhuma categoria cadastrada',
    createLabel: 'Nova categoria',
    service: this.service,
    initialValue: () => ({ id: null, name: '', description: '', type: 'EXPENSE', active: true }),
    getId: (item) => item.id,
    columns: [
      { key: 'name', label: 'Nome', cell: (row) => row.name },
      { key: 'type', label: 'Tipo', cell: (row) => row.type === 'INCOME' ? 'Receita' : 'Despesa' },
      { key: 'active', label: 'Status', cell: (row) => row.active ? 'Ativa' : 'Inativa' }
    ],
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'description', label: 'Descrição', type: 'textarea' },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: [{ label: 'Receita', value: 'INCOME' }, { label: 'Despesa', value: 'EXPENSE' }] }
    ]
  };
}
