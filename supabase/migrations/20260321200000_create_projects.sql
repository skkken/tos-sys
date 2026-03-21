-- projectsテーブル
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id)
);

-- インデックス
create index idx_projects_user_id on projects (user_id);
create index idx_projects_status on projects (status);

-- RLSポリシー
alter table projects enable row level security;

create policy "ユーザーは自身のプロジェクトのみ参照可能"
  on projects for select to authenticated
  using (auth.uid() = user_id);

create policy "ユーザーは自身のプロジェクトのみ作成可能"
  on projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "ユーザーは自身のプロジェクトのみ更新可能"
  on projects for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ユーザーは自身のプロジェクトのみ削除可能"
  on projects for delete to authenticated
  using (auth.uid() = user_id);

-- updated_at自動更新トリガー（共通関数）
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();
