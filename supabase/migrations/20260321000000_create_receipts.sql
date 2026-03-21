-- receiptsテーブル
create table receipts (
  id uuid primary key default gen_random_uuid(),
  amount integer not null check (amount > 0),
  date date not null,
  store_name text not null default '',
  payment_method text not null check (payment_method in ('card', 'cash', 'other')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- インデックス
create index idx_receipts_date on receipts (date desc);

-- RLSポリシー
alter table receipts enable row level security;

create policy "認証済みユーザーは全領収書を操作可能"
  on receipts for all to authenticated
  using (true) with check (true);
