insert into storage.buckets (id, name, public) values ('routine-icons', 'routine-icons', true);

create policy "Public can view routine icons"
on storage.objects for select
using (bucket_id = 'routine-icons');

create policy "Authenticated can upload routine icons"
on storage.objects for insert
to authenticated
with check (bucket_id = 'routine-icons');

create policy "Authenticated can update routine icons"
on storage.objects for update
to authenticated
using (bucket_id = 'routine-icons');

create policy "Authenticated can delete routine icons"
on storage.objects for delete
to authenticated
using (bucket_id = 'routine-icons');