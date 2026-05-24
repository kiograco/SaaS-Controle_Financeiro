/**
 * Formata um número para formato de moeda BRL (R$ 1.234,56)
 */
export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value ?? 0);
}

/**
 * Converte uma string de entrada em padrão BR (1.234,56) para número (1234.56)
 * Aceita: "1234" → 1234, "1.234,56" → 1234.56, "1234,56" → 1234.56
 */
export function parseBrCurrency(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const str = String(value).trim();
  // Remove espaços e símbolos de moeda
  let cleaned = str.replace(/[R$\s]/g, '');
  // Converte formato BR para número: 1.234,56 → 1234.56
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata entrada de usuário para padrão financeiro BR
 * Enquanto o usuário digita: "1234567" → "1.234.567,00"
 */
export function formatInputCurrency(value: string): string {
  if (!value) {
    return '';
  }
  // Remove tudo que não é número
  let numeros = value.replace(/\D/g, '');
  
  if (!numeros) {
    return '';
  }
  
  // Garante que tem pelo menos 3 dígitos (centavos)
  if (numeros.length <= 2) {
    return `0,${numeros.padStart(2, '0')}`;
  }
  
  // Separa os centavos
  const centavos = numeros.slice(-2);
  const parteInteira = numeros.slice(0, -2);
  
  // Adiciona separador de milhar
  const formatted = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted},${centavos}`;
}

/**
 * Formata a digitação monetária preservando a parte decimal informada pelo usuário.
 * Exemplos:
 * "12" -> "12"
 * "12,3" -> "12,3"
 * "1234,56" -> "1.234,56"
 */
export function formatPartialMoneyInput(value: string): string {
  if (!value) {
    return '';
  }

  const sanitized = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(/[^0-9,]/g, '');

  const [rawInteger = '', ...decimalParts] = sanitized.split(',');
  const decimal = decimalParts.join('').slice(0, 2);
  const normalizedInteger = rawInteger.replace(/^0+(?=\d)/, '') || '0';
  const formattedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (sanitized.includes(',')) {
    return `${formattedInteger},${decimal}`;
  }

  return formattedInteger;
}

/**
 * Formata um número para o padrão de input monetário BR sem símbolo (1.234,56)
 */
export function formatMoneyInputValue(value: number | null | undefined): string {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

/**
 * Normaliza um valor para ser enviado ao backend (string ou número para número)
 */
export function normalizeMoneyValue(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  return parseBrCurrency(value);
}

export function formatDateBr(date: string | null | undefined): string {
  if (!date) {
    return '-';
  }
  const parsed = new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(parsed);
}

export function minutesToHours(minutes: number): string {
  const total = Math.max(minutes, 0);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return `${hours}h ${String(remainder).padStart(2, '0')}min`;
}
