-- Phase B: DELETE /candidates/{id} needs to remove the Storage object, not
-- just the Postgres row. storage.objects for the `resumes` bucket only had
-- SELECT/INSERT policies (0006/0007) -- add the matching DELETE policy so
-- the tenant-scoped Storage call in candidate_service.py can succeed under
-- RLS instead of being silently rejected.
create policy "resumes_tenant_isolation_delete" on storage.objects
  for delete using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select private.current_tenant_id())::text
  );
