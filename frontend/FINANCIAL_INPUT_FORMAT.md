# Formatação de Valores Financeiros

## Descrição
Implementação completa de formatação de valores no padrão financeiro brasileiro (vírgula como separador decimal e ponto como separador de milhar).

## Componentes Implementados

### 1. **Utilitários de Formatação** (`src/app/shared/utils/formatters.ts`)
- `formatCurrency(value)` - Formata número para moeda BRL (ex: R$ 1.234,56)
- `parseBrCurrency(value)` - Converte entrada BR (1.234,56) para número (1234.56)
- `formatInputCurrency(value)` - Formata entrada enquanto usuário digita (máscara)
- `normalizeMoneyValue(value)` - Normaliza valor para enviar ao backend

### 2. **Directive de Entrada** (`src/app/shared/directives/money-input.directive.ts`)
- `MoneyInputDirective` - Aplicado em inputs de tipo `money`
- Formata automaticamente enquanto digita
- Converte valor ao sair do campo (blur)
- Suporta entrada com vírgula ou ponto

### 3. **Validador** (`src/app/shared/validators/br-validators.ts`)
- `positiveMoneyValidator()` - Valida se valor é positivo (> 0)
- Converte vírgula para ponto para validação

### 4. **Componente Genérico** (`src/app/shared/components/resource-page.component.ts`)
- Tipo de campo `'money'` adicionado
- Suporte a validadores customizados por campo
- Aplicação automática do directive em campos money

## Como Usar

### Em Uma Página de Formulário

```typescript
import { positiveMoneyValidator } from '../../../shared/validators/br-validators';

export class SuaPageComponent {
  readonly config: ResourcePageConfig<SeuModelo> = {
    // ... outras configurações
    fields: [
      // Campo de valor financeiro
      { 
        key: 'amount', 
        label: 'Valor', 
        type: 'money',  // ← Tipo "money" ativa formatação
        required: true, 
        validators: [positiveMoneyValidator()]  // ← Validação de valor positivo
      },
      // Campo comum (não financeiro)
      { 
        key: 'description', 
        label: 'Descrição', 
        type: 'text', 
        required: true 
      }
    ]
  };
}
```

## Comportamento

### Entrada do Usuário
- Usuario digita: `1234567`
- Formata para: `1.234.567,00`
- Armazenado no formulário como: `1234567`

### Aceita Múltiplos Formatos
- `1234` → 1234,00
- `1234,56` → 1234,56
- `1.234,56` → 1234,56 ✓ Padrão BR
- `1234.56` → Detecta ponto e converte para 1234,56

### No Backend
- Valor é enviado como: `1234567` ou `1234.56` (número)
- Backend recebe em BigDecimal com 2 casas decimais
- Exemplo: `1234.56` (no Java/JSON)

## Campos Atualizados

### Contas a Pagar
- ✅ `amount` - tipo `'money'` com `positiveMoneyValidator()`
- ✅ `paidAmount` - tipo `'money'`

### Contas a Receber  
- ✅ `amount` - tipo `'money'` com `positiveMoneyValidator()`
- ✅ `receivedAmount` - tipo `'money'`

### Transações Financeiras
- ✅ `amount` - tipo `'money'` com `positiveMoneyValidator()`

## Exemplos

### Formatação na Exibição
```typescript
import { formatCurrency } from '../../../shared/utils/formatters';

// No template
{{ formatCurrency(row.amount) }}  // Exibe: R$ 1.234,56
```

### Parsing de Entrada
```typescript
import { parseBrCurrency } from '../../../shared/utils/formatters';

// Converte entrada do usuário
const valor = parseBrCurrency('1.234,56');  // Retorna: 1234.56
```

## Validação

A validação `positiveMoneyValidator()` garante:
- ✓ Aceita valores > 0
- ✓ Rejeita valores = 0
- ✓ Rejeita valores negativos
- ✓ Trabalha com vírgula ou ponto como separador

```typescript
// Campo obrigatório e com validação
{ 
  key: 'amount', 
  label: 'Valor', 
  type: 'money',
  required: true,
  validators: [positiveMoneyValidator()]
}

// Campo opcional (pode ser 0)
{ 
  key: 'paidAmount', 
  label: 'Valor pago', 
  type: 'money',
  required: true
  // Sem positiveMoneyValidator() - permite 0
}
```

## Testes

Tested com:
- ✅ Entrada manual: 1234567 → 1.234.567,00
- ✅ Formatação com ponto: 1.234,56
- ✅ Validação positiva
- ✅ Conversão para backend
- ✅ Compatibilidade com Material Design

## Próximos Passos (Opcional)

1. Adicionar testes unitários para o directive
2. Adicionar testes E2E para fluxo de entrada
3. Implementar máscara para outros campos (CPF, CNPJ, telefone)
4. Adicionar mensagens de erro customizadas para validação
5. Implementar formatação na tabela de exibição usando pipe BRL
