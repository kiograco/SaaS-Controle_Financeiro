update users
set password_hash = '$2a$10$/IZD1/kbTDsnH7b/NbemE.JyFP/S1gjdMHPB39owmiOomiBaz5hra',
    updated_at = now(),
    version = version + 1
where id = '22222222-2222-2222-2222-222222222222'
  and email = 'admin@empresa.com.br';
