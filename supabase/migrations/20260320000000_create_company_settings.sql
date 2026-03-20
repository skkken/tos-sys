create table company_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table company_settings enable row level security;

create policy "認証済みユーザーは全設定を読み取れる"
  on company_settings for select to authenticated using (true);

create policy "認証済みユーザーは設定を更新できる"
  on company_settings for update to authenticated using (true) with check (true);

create policy "認証済みユーザーは設定を挿入できる"
  on company_settings for insert to authenticated with check (true);

insert into company_settings (key, value) values
  ('company_name', ''),
  ('address', ''),
  ('bank_info', ''),
  ('invoice_registration_number', ''),
  ('phone', ''),
  ('email', '');
