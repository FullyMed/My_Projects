/*
  # Self-serve account deletion

  `delete_my_account()` lets a signed-in user permanently delete their own
  account. It deletes the caller's row from auth.users; profiles,
  planner_tasks, goals and events all reference auth.users with
  ON DELETE CASCADE, so every row they own goes with it.

  - SECURITY DEFINER: only the function owner (postgres) can delete from
    auth.users, so the function runs with the owner's rights. It can only
    ever touch `auth.uid()` — the caller's own id from their JWT.
  - search_path pinned to '' (Supabase linter: function_search_path_mutable).
  - EXECUTE revoked from PUBLIC/anon and granted only to `authenticated`.

  Called from the client as `supabase.rpc('delete_my_account')`
  (AuthContext.deleteAccount → Settings → Delete account).
*/

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_my_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
