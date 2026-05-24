# Frontend SaaS Finance

Frontend Angular para o sistema multiempresa de Gestão Financeira e Gestão de Ponto.

## Descrição do frontend

Aplicação SPA em Angular com autenticação JWT, contexto de empresa, painéis financeiros, CRUDs operacionais e fluxo de importação CSV para Gestão de Ponto. A interface foi construída em pt-BR, com foco em experiência SaaS profissional, responsividade e integração com a API Spring Boot do projeto.

## Tecnologias

- Angular 18
- TypeScript
- Angular Router
- Reactive Forms
- Angular Material
- RxJS
- SCSS
- Chart.js com `ng2-charts`
- Docker + Nginx

## Estrutura de pastas

```text
src/app/
- core/
  - auth, guards, interceptors, models, services
- shared/
  - components, pipes, validators, utils
- layout/
  - shell principal
- features/
  - auth
  - dashboard
  - companies
  - finance
  - time-tracking
  - settings
```

## Como rodar localmente

1. Instale as dependências:

```bash
cd frontend
npm install
```

2. Inicie o frontend:

```bash
npm start
```

3. Acesse:

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080`

## Como configurar a API

Os arquivos de ambiente usam por padrão:

```ts
apiUrl: 'http://localhost:8080/api/v1'
```

Arquivos:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

## Como rodar testes

```bash
npm test
```

## Telas principais

- Login, cadastro, recuperação e redefinição de senha
- Dashboard financeiro com indicadores e gráficos
- Gestão financeira: categorias, centros de custo, contas bancárias, contas a pagar, contas a receber e transações
- Gestão de Ponto: funcionários, jornadas, registros, espelhos, relatórios e importação CSV
- Empresa: dados da empresa e usuários/permissões
- Configurações visuais

## Fluxo de autenticação

- Login e cadastro integrados à API
- JWT enviado automaticamente via interceptor
- Refresh token automático em respostas `401`
- Encerramento de sessão com limpeza segura do contexto

## Multiempresa

- Seleção de empresa no topo da aplicação
- Bloqueio de telas protegidas quando nenhuma empresa está selecionada
- Envio do cabeçalho `X-Company-Id` em requisições protegidas
- Menus filtrados por papéis da membership atual

## Segurança

- Guards de autenticação, empresa selecionada e roles
- Tratamento global de `401` e `403`
- Sem logs de token JWT
- Upload CSV validado antes do envio
- Mensagens de erro amigáveis em pt-BR

## Gestão financeira

- Dashboard com métricas e gráficos
- CRUDs com filtros, busca e edição inline
- Formatação monetária em BRL
- Resumos por categoria, centro de custo e conta bancária

## Gestão de ponto

- Funcionários e jornadas
- Registros manuais de ponto
- Espelhos por período
- Relatório mensal com horas trabalhadas, extras e faltas

## Importação CSV

- Upload de CSV exportado do Excel
- Validação básica de extensão e tamanho antes do envio
- Preview antes da confirmação
- Histórico de lotes
- Visualização de erros por linha

Layout esperado:

```csv
cpf;data;hora;tipo;nome;matricula;departamento;observacao
12345678901;21/05/2026;08:00;ENTRADA;João Silva;EMP001;Financeiro;
```

## Build de produção

```bash
npm run build
```

Os arquivos finais são gerados em `dist/finance-frontend`.

## Docker

Build da imagem:

```bash
docker build -t finance-frontend ./frontend
```

Execução:

```bash
docker run --rm -p 4200:80 finance-frontend
```
