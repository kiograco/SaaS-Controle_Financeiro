create extension if not exists "pgcrypto";

create table users (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    email varchar(120) not null unique,
    password_hash varchar(255) not null,
    active boolean not null default true
);

create table user_global_roles (
    user_id uuid not null references users(id),
    role varchar(50) not null
);

create table companies (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    legal_name varchar(120) not null,
    trade_name varchar(100) not null,
    cnpj varchar(18) not null unique,
    active boolean not null default true
);

create table company_memberships (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    user_id uuid not null references users(id),
    company_id uuid not null references companies(id),
    active boolean not null default true
);

create table company_membership_roles (
    membership_id uuid not null references company_memberships(id),
    role varchar(50) not null
);

create table refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    user_id uuid not null references users(id),
    token varchar(200) not null unique,
    expires_at timestamptz not null,
    revoked boolean not null default false
);

create table categories (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    description varchar(255),
    type varchar(30) not null,
    active boolean not null default true
);

create table cost_centers (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    code varchar(30) not null,
    active boolean not null default true
);

create table bank_accounts (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    bank_name varchar(120) not null,
    branch_number varchar(20),
    account_number varchar(30) not null,
    balance numeric(19,2) not null default 0,
    active boolean not null default true
);

create table accounts_payable (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    category_id uuid references categories(id),
    cost_center_id uuid references cost_centers(id),
    bank_account_id uuid references bank_accounts(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    description varchar(160) not null,
    supplier_name varchar(120) not null,
    due_date date not null,
    amount numeric(19,2) not null,
    paid_amount numeric(19,2) not null default 0,
    status varchar(30) not null,
    notes varchar(500)
);

create table accounts_receivable (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    category_id uuid references categories(id),
    cost_center_id uuid references cost_centers(id),
    bank_account_id uuid references bank_accounts(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    description varchar(160) not null,
    customer_name varchar(120) not null,
    due_date date not null,
    amount numeric(19,2) not null,
    received_amount numeric(19,2) not null default 0,
    status varchar(30) not null,
    notes varchar(500)
);

create table financial_transactions (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    category_id uuid references categories(id),
    cost_center_id uuid references cost_centers(id),
    bank_account_id uuid not null references bank_accounts(id),
    payable_id uuid references accounts_payable(id),
    receivable_id uuid references accounts_receivable(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    description varchar(160) not null,
    transaction_date date not null,
    type varchar(30) not null,
    amount numeric(19,2) not null,
    notes varchar(500)
);

create table attachments (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    reference_type varchar(30) not null,
    reference_id uuid not null,
    file_name varchar(150) not null,
    content_type varchar(80) not null,
    storage_path varchar(255) not null
);

create table employees (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    cpf varchar(11) not null,
    email varchar(120),
    registration_number varchar(30),
    department varchar(80),
    position varchar(80),
    active boolean not null default true
);

create table work_schedules (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    name varchar(120) not null,
    expected_daily_minutes integer not null,
    tolerance_minutes integer not null,
    lunch_break_minutes integer not null,
    active boolean not null default true
);

create table employee_work_schedules (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    employee_id uuid not null references employees(id),
    work_schedule_id uuid not null references work_schedules(id),
    start_date date not null,
    end_date date
);

create table time_entries (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    employee_id uuid not null references employees(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    entry_date date not null,
    entry_time time not null,
    type varchar(30) not null,
    source varchar(30) not null,
    notes varchar(255)
);

create table time_sheets (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    employee_id uuid not null references employees(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    reference_date date not null,
    worked_minutes integer not null,
    overtime_minutes integer not null,
    missing_minutes integer not null,
    status varchar(30) not null,
    calculated_at timestamptz not null
);

create table time_import_batches (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    file_name varchar(160) not null,
    status varchar(40) not null,
    total_rows integer not null default 0,
    success_rows integer not null default 0,
    error_rows integer not null default 0,
    imported_by_user_id uuid not null references users(id),
    finished_at timestamptz
);

create table time_import_errors (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    batch_id uuid not null references time_import_batches(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    row_number integer not null,
    raw_content varchar(500) not null,
    error_message varchar(255) not null
);

create table audit_logs (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id),
    user_id uuid references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    version bigint not null default 0,
    action varchar(50) not null,
    resource varchar(50) not null,
    resource_id varchar(36) not null,
    description varchar(500) not null
);

create index idx_categories_company on categories(company_id);
create index idx_cost_centers_company on cost_centers(company_id);
create index idx_bank_accounts_company on bank_accounts(company_id);
create index idx_payable_company on accounts_payable(company_id);
create index idx_receivable_company on accounts_receivable(company_id);
create index idx_transactions_company on financial_transactions(company_id);
create index idx_employees_company on employees(company_id);
create index idx_employees_cpf on employees(company_id, cpf);
create unique index uq_employee_cpf_company on employees(company_id, cpf) where deleted_at is null;
create index idx_time_entries_company on time_entries(company_id);
create index idx_time_entries_employee on time_entries(company_id, employee_id, entry_date);
create unique index uq_time_entries_unique on time_entries(company_id, employee_id, entry_date, entry_time, type) where deleted_at is null;
create index idx_time_sheets_company on time_sheets(company_id);
create index idx_time_sheets_employee_reference on time_sheets(company_id, employee_id, reference_date);
create unique index uq_time_sheet_company_employee_reference on time_sheets(company_id, employee_id, reference_date) where deleted_at is null;
create index idx_time_sheets_status on time_sheets(company_id, status);
create index idx_time_import_batches_company on time_import_batches(company_id);
create index idx_time_import_errors_company_batch on time_import_errors(company_id, batch_id);
create index idx_audit_logs_company on audit_logs(company_id);

insert into companies (id, legal_name, trade_name, cnpj) values
('11111111-1111-1111-1111-111111111111', 'Empresa Exemplo LTDA', 'Empresa Exemplo', '12345678000190');

insert into users (id, name, email, password_hash) values
('22222222-2222-2222-2222-222222222222', 'Administrador Geral', 'admin@empresa.com.br', '$2a$10$VY48h58rI5rN5Cw4q0p0YelRk5v0zzakDx4zY/boYYGr2susx6bwy');

insert into user_global_roles (user_id, role) values
('22222222-2222-2222-2222-222222222222', 'SUPER_ADMIN');

insert into company_memberships (id, user_id, company_id) values
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

insert into company_membership_roles (membership_id, role) values
('33333333-3333-3333-3333-333333333333', 'COMPANY_ADMIN'),
('33333333-3333-3333-3333-333333333333', 'FINANCE_MANAGER'),
('33333333-3333-3333-3333-333333333333', 'HR_MANAGER');
