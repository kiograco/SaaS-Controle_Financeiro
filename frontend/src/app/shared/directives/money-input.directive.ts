import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatInputCurrency, parseBrCurrency, normalizeMoneyValue } from '../utils/formatters';

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
export class MoneyInputDirective implements OnInit {
  @Input() showCurrency = false;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) {}

  ngOnInit() {
    // Define o tipo de input como text para aceitar máscara
    this.el.nativeElement.type = 'text';
    // Define o padrão de entrada (números, vírgula, ponto)
    this.el.nativeElement.inputMode = 'decimal';
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Se vazio, limpa
    if (!value) {
      input.value = '';
      return;
    }

    // Formata a entrada
    const formatted = formatInputCurrency(value);
    input.value = formatted;

    // Atualiza o controle do formulário com o número normalizado
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

    // Garante o valor correto no controle
    if (this.ngControl && this.ngControl.control) {
      const numericValue = parseBrCurrency(value);
      this.ngControl.control.setValue(numericValue, { emitEvent: false });
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    // Seleciona todo o texto ao focar para facilitar edição
    input.select();
  }
}
