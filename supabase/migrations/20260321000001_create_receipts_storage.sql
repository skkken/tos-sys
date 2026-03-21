-- receiptsバケットをprivateで作成
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', false);

-- Storage RLSポリシー
create policy "認証済みユーザーは領収書画像をアップロード可能"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts');

create policy "認証済みユーザーは領収書画像を閲覧可能"
  on storage.objects for select to authenticated
  using (bucket_id = 'receipts');

create policy "認証済みユーザーは領収書画像を削除可能"
  on storage.objects for delete to authenticated
  using (bucket_id = 'receipts');
