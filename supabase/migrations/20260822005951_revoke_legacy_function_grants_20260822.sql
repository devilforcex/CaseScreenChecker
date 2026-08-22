-- Remove legacy direct grants left by the pre-baseline schema. PUBLIC revoke
-- alone does not remove privileges granted explicitly to anon/authenticated.
begin;

revoke all on function public.get_user_role() from anon;
revoke all on function public.handle_new_user() from anon, authenticated;

commit;
