alter table work_schedules
    add column if not exists start_time time;

alter table work_schedules
    add column if not exists end_time time;

update work_schedules
set start_time = coalesce(start_time, time '08:00'),
    end_time = coalesce(end_time, time '18:00');

alter table work_schedules
    alter column start_time set not null;

alter table work_schedules
    alter column end_time set not null;
