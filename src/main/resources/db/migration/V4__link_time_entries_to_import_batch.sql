alter table time_entries
    add column if not exists import_batch_id uuid references time_import_batches(id);

create index if not exists idx_time_entries_import_batch_id
    on time_entries(import_batch_id);
