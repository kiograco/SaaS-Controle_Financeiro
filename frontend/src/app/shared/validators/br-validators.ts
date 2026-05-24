import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = onlyDigits(control.value ?? '');
    if (!cpf) {
      return null;
    }
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return { cpf: true };
    }
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += Number(cpf[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) {
      digit = 0;
    }
    if (digit !== Number(cpf[9])) {
      return { cpf: true };
    }
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += Number(cpf[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) {
      digit = 0;
    }
    return digit === Number(cpf[10]) ? null : { cpf: true };
  };
}

export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cnpj = onlyDigits(control.value ?? '');
    if (!cnpj) {
      return null;
    }
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
      return { cnpj: true };
    }
    return null;
  };
}

export function positiveMoneyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const value = Number(String(control.value).replace(',', '.'));
    return value > 0 ? null : { positiveMoney: true };
  };
}

export function nonNegativeMoneyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const value = Number(String(control.value).replace(',', '.'));
    return value >= 0 ? null : { nonNegativeMoney: true };
  };
}

export function digitsOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return null;
    }

    return /^\d+$/.test(value) ? null : { digitsOnly: true };
  };
}

export function bankAccountNumberValidator(bankFieldKey = 'bankName'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim().toUpperCase();
    if (!value) {
      return null;
    }

    const bankName = String(control.parent?.get(bankFieldKey)?.value ?? '');
    const isBancoDoBrasil = bankName.startsWith('001 - Banco do Brasil S.A.');
    const pattern = isBancoDoBrasil ? /^\d+X?$/ : /^\d+$/;

    return pattern.test(value) ? null : { bankAccountNumber: true };
  };
}

export function time24hValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return null;
    }

    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? null : { time24h: true };
  };
}

export function brDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? null : { brDate: true };
  };
}

export function csvFileValidator(maxSizeMb = 5): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File | null;
    if (!file) {
      return null;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { csvType: true };
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return { fileSize: true };
    }
    return null;
  };
}
