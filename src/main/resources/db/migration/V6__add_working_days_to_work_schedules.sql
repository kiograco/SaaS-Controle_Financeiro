alter table work_schedules
    add column if not exists working_days varchar(80);

update work_schedules
set working_days = coalesce(working_days, 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY');

alter table work_schedules
    alter column working_days set not null;
