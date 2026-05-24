import { Pipe, PipeTransform } from '@angular/core';
import { minutesToHours } from '../utils/formatters';

@Pipe({
  name: 'minutes',
  standalone: true
})
export class MinutesPipe implements PipeTransform {
  transform(value: number): string {
    return minutesToHours(value);
  }
}
