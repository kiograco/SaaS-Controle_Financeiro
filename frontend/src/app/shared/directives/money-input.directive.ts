import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { formatMoneyInputValue, formatPartialMoneyInput, parseBrCurrency } from '../utils/formatters';

/**
 * Directive para aplicar máscara de entrada financeira em padrão BR
 * Uso: <input matInput appMoneyInput>
 * 
 * - Aceita entrada com vírgula ou ponto
 * - Formata automaticamente enquanto digita (1234567 → 1.234.567,00)
 * - Converte para número correto antes de enviar
 */
@Directive({
  selector: 'input[appMoneyInput]',
  standalone: true
})
export class MoneyInputDirective implements OnInit, OnDestroy {
  @Input() showCurrency = false;
  private controlSubscription?: Subscription;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) {}

  ngOnInit() {
    this.el.nativeElement.type = 'text';
    this.el.nativeElement.inputMode = 'decimal';
    this.syncInputFromControl();
    this.controlSubscription = this.ngControl.control?.valueChanges.subscribe(() => {
      this.syncInputFromControl();
    });
  }

  ngOnDestroy() {
    this.controlSubscription?.unsubscribe();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Se vazio, limpa
    if (!value) {
      input.value = '';
      this.ngControl.control?.setValue(null, { emitEvent: false });
      return;
    }

    // Formata a entrada
    const formatted = formatPartialMoneyInput(value);
    input.value = formatted;

    if (this.ngControl && this.ngControl.control) {
      const numericValue = parseBrCurrency(formatted);
      this.ngControl.control.setValue(numericValue, { emitEvent: false });
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value) {
      return;
    }

    if (this.ngControl && this.ngControl.control) {
      const numericValue = parseBrCurrency(value);
      this.ngControl.control.setValue(numericValue, { emitEvent: false });
      input.value = formatMoneyInputValue(numericValue);
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '0,00') {
      input.value = '';
      this.ngControl.control?.setValue(null, { emitEvent: false });
    }

    input.value = formatPartialMoneyInput(input.value);
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }

  private syncInputFromControl() {
    const controlValue = this.ngControl.control?.value;
    if (controlValue === null || controlValue === undefined || controlValue === '') {
      this.el.nativeElement.value = '';
      return;
    }

    if (typeof controlValue === 'number') {
      this.el.nativeElement.value = formatMoneyInputValue(controlValue);
      return;
    }

    const numericValue = parseBrCurrency(String(controlValue));
    this.el.nativeElement.value = formatMoneyInputValue(numericValue);
  }
}
