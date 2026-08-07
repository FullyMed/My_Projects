-- Private bucket for uploaded resume PDFs, path convention:
--   resumes/{tenant_id}/{candidate_id}.pdf
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resumes_tenant_isolation_select" on storage.objects
  for select using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select public.current_tenant_id())::text
  );

create policy "resumes_tenant_isolation_insert" on storage.objects
  for insert with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select public.current_tenant_id())::text
  );
