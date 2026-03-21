-- tasksテーブル
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id)
);

-- インデックス
create index idx_tasks_user_id on tasks (user_id);
create index idx_tasks_status on tasks (status);
create index idx_tasks_priority on tasks (priority);
create index idx_tasks_project_id on tasks (project_id);
create index idx_tasks_due_date on tasks (due_date);

-- RLSポリシー
alter table tasks enable row level security;

create policy "ユーザーは自身のタスクのみ参照可能"
  on tasks for select to authenticated
  using (auth.uid() = user_id);

create policy "ユーザーは自身のタスクのみ作成可能"
  on tasks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "ユーザーは自身のタスクのみ更新可能"
  on tasks for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ユーザーは自身のタスクのみ削除可能"
  on tasks for delete to authenticated
  using (auth.uid() = user_id);

-- updated_at自動更新トリガー（1.1で作成した共通関数を再利用）
create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();
