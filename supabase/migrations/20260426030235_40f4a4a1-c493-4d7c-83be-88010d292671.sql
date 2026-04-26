-- Update the new-user role handler to assign 'operator' instead of 'viewer'
-- so newly signed-up users can immediately access the operator console.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'operator')
  on conflict (user_id, role) do nothing;
  return new;
end;
$function$;

-- Attach the trigger to auth.users so a role row is created on every signup.
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();