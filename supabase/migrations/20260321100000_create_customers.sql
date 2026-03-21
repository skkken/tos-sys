-- customersテーブル
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_kana text,
  company_name text,
  email text,
  phone text,
  postal_code text,
  address text,
  contact_person text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id)
);

-- インデックス
create index idx_customers_user_id on customers (user_id);
create index idx_customers_status on customers (status);
create index idx_customers_name on customers (name);

-- RLSポリシー
alter table customers enable row level security;

create policy "ユーザーは自身の顧客のみ参照可能"
  on customers for select to authenticated
  using (auth.uid() = user_id);

create policy "ユーザーは自身の顧客のみ作成可能"
  on customers for insert to authenticated
  with check (auth.uid() = user_id);

create policy "ユーザーは自身の顧客のみ更新可能"
  on customers for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ユーザーは自身の顧客のみ削除可能"
  on customers for delete to authenticated
  using (auth.uid() = user_id);

-- updated_at自動更新トリガー
create or replace function update_customers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger customers_updated_at
  before update on customers
  for each row execute function update_customers_updated_at();
