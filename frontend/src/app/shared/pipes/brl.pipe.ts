import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../utils/formatters';

@Pipe({
  name: 'brl',
  standalone: true
})
export class BrlPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatCurrency(value);
  }
}
