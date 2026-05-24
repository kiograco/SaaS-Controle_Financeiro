import { FormControl } from '@angular/forms';
import {
  brDateValidator,
  cpfValidator,
  csvFileValidator,
  positiveMoneyValidator
} from './br-validators';

describe('br-validators', () => {
  it('deve aceitar um CPF valido', () => {
    const control = new FormControl('529.982.247-25');

    expect(cpfValidator()(control)).toBeNull();
  });

  it('deve rejeitar um CPF invalido', () => {
    const control = new FormControl('111.111.111-11');

    expect(cpfValidator()(control)).toEqual({ cpf: true });
  });

  it('deve validar data brasileira', () => {
    expect(brDateValidator()(new FormControl('21/05/2026'))).toBeNull();
    expect(brDateValidator()(new FormControl('2026-05-21'))).toEqual({ brDate: true });
  });

  it('deve validar valor monetario positivo', () => {
    expect(positiveMoneyValidator()(new FormControl('10,50'))).toBeNull();
    expect(positiveMoneyValidator()(new FormControl('0'))).toEqual({ positiveMoney: true });
  });

  it('deve validar tipo e tamanho do CSV', () => {
    const csv = new File(['cpf;data'], 'ponto.csv', { type: 'text/csv' });
    const invalid = new File(['conteudo'], 'ponto.txt', { type: 'text/plain' });

    expect(csvFileValidator()(new FormControl(csv))).toBeNull();
    expect(csvFileValidator()(new FormControl(invalid))).toEqual({ csvType: true });
  });
});
