# SaaS Controle Financeiro

Sistema SaaS multiempresa de gestao financeira e gestao de ponto, com backend em Java 21 + Spring Boot 3 e frontend em Angular 18.

## Visao geral

O projeto combina:

- autenticacao JWT com controle de acesso por perfil
- isolamento por empresa com `company_id`
- modulos financeiros completos
- gestao de ponto com funcionarios, jornadas, registros, espelho, relatorios e importacao CSV
- auditoria de operacoes criticas

## Funcionalidades principais

- Multiempresa com selecao obrigatoria de empresa antes de usar as areas internas
- Perfis: `SUPER_ADMIN`, `COMPANY_ADMIN`, `FINANCE_MANAGER`, `FINANCE_VIEWER`, `HR_MANAGER`, `HR_VIEWER`
- CRUD de categorias, centros de custo, contas bancarias, contas a pagar, contas a receber e transacoes
- Dashboard e relatorios financeiros
- Cadastro de funcionarios
- Cadastro de jornadas com:
  - minutos diarios esperados
  - tolerancia
  - minutos de descanso
  - horario de entrada
  - horario de saida
- Vinculo de jornada ao funcionario
- Registros manuais de ponto com selecao de funcionario por nome
- Espelho de ponto por periodo
- Relatorio mensal de ponto
- Importacao CSV com preview, confirmacao, historico de lotes, erros por linha e exclusao de lote importado

## Tecnologias

- Java 21
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway
- Bean Validation
- MapStruct
- Angular 18
- Angular Material
- RxJS
- Docker / Docker Compose

## Estrutura

Backend em `src/main/java/com/example/finance`:

- `auth`, `security`, `user`, `company`, `membership`
- `category`, `costcenter`, `bankaccount`, `payable`, `receivable`, `transaction`, `dashboard`
- `employee`, `timeschedule`, `timeentry`, `timesheet`, `timeimport`, `timereport`
- `audit`, `common`, `exception`

Frontend em `frontend/src/app`:

- `core`
- `shared`
- `layout`
- `features/auth`
- `features/companies`
- `features/finance`
- `features/time-tracking`
- `features/settings`

## Fluxo multiempresa

- Ao entrar no sistema, a escolha da empresa e obrigatoria
- Se nenhuma empresa estiver ativa, o usuario e redirecionado para `/company/select`
- O seletor do topo foi removido; a troca de empresa fica centralizada na tela de selecao

## Gestao de ponto

### Jornadas

Cada jornada pode armazenar:

- nome
- horario de entrada
- horario de saida
- minutos diarios esperados
- tolerancia
- minutos de descanso

Tambem existe um bloco para vincular a jornada a um funcionario ja cadastrado.

### Registros de ponto

- o funcionario e selecionado pelo nome
- o campo de hora segue o padrao de horario
- os registros importados e manuais alimentam o espelho e os relatorios

### Calculo de horas

O sistema considera como referencia padrao:

- 8 horas de trabalho por dia
- 2 horas de descanso como padrao operacional quando nao houver configuracao mais especifica

Quando o funcionario possui jornada vinculada, a jornada cadastrada passa a ser a referencia principal para calculos.

### Importacao CSV

Layout aceito:

```csv
cpf;data;hora;tipo;nome;matricula;departamento;observacao
```

Formatos aceitos:

- separador `;` ou `,`
- data: `dd/MM/yyyy`, `dd-MM-yyyy`, `yyyy-MM-dd`
- hora: `HH:mm` ou `HH:mm:ss`

Tipos aceitos no CSV:

- `Entrada`
- `Saida Almoco`
- `Retorno Almoco`
- `Saida`
- `Ajuste Manual`

O fluxo de importacao:

1. gerar preview
2. confirmar importacao
3. consultar historico e erros
4. abrir espelho do periodo ou relatorio do mes importado
5. excluir o lote importado, se necessario

Observacoes importantes:

- o sistema trata BOM no cabecalho do arquivo
- funcionarios ausentes podem ser criados automaticamente
- funcionarios criados pela importacao permanecem cadastrados para reutilizacao em novos CSVs

## Endpoints principais

### Financeiro

- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/categories`
- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/cost-centers`
- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/bank-accounts`
- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/payables`
- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/receivables`
- `GET/POST/PUT/DELETE /api/v1/companies/{companyId}/transactions`
- `GET /api/v1/companies/{companyId}/dashboard`
- `GET /api/v1/companies/{companyId}/reports/monthly`

### Ponto

- `GET/POST /api/v1/companies/{companyId}/employees`
- `GET/POST/PUT /api/v1/companies/{companyId}/work-schedules`
- `POST /api/v1/companies/{companyId}/work-schedules/assignments`
- `GET/POST /api/v1/companies/{companyId}/time/entries`
- `GET /api/v1/companies/{companyId}/time/sheets`
- `POST /api/v1/companies/{companyId}/time/sheets/recalculate`
- `GET /api/v1/companies/{companyId}/time/reports/monthly`
- `POST /api/v1/companies/{companyId}/time/imports/preview`
- `POST /api/v1/companies/{companyId}/time/imports/confirm`
- `GET /api/v1/companies/{companyId}/time/imports`
- `GET /api/v1/companies/{companyId}/time/imports/{batchId}/errors`
- `DELETE /api/v1/companies/{companyId}/time/imports/{batchId}`

## Como rodar com Docker

1. Copie `.env.example` para `.env`
2. Rode:

```bash
docker compose up --build
```

Enderecos:

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`

## Como rodar sem Docker

### Backend

1. Configure um PostgreSQL local
2. Ajuste as variaveis do `.env.example`
3. Rode:

```bash
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Migracoes

As migracoes ficam em `src/main/resources/db/migration`.

Migracoes recentes relevantes:

- `V4__link_time_entries_to_import_batch.sql`
- `V5__add_times_to_work_schedules.sql`

Se o backend subir sem essas migracoes aplicadas, telas de ponto e jornadas podem falhar.

## Testes

Backend:

```bash
mvn test
```

Frontend:

```bash
cd frontend
npm test
```

## Swagger

- UI: `http://localhost:8080/swagger`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Credenciais seed

- Usuario: `admin@empresa.com.br`
- Senha: `Senha@123`

## Observacoes

- O frontend usa `http://localhost:8080/api/v1` por padrao
- Relatorios e espelhos de ponto dependem da empresa selecionada
- Para refletir mudancas no frontend em desenvolvimento, use `Ctrl+F5` no navegador
