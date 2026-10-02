-- Grant admin to all existing users so you can log in immediately
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Auto-confirm all existing users
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- Automatically grant admin for new users
CREATE OR REPLACE FUNCTION public.auto_setup_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_after ON auth.users;
CREATE TRIGGER on_auth_user_created_after
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_setup_new_user();

-- Automatically confirm email for new users
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users;
CREATE TRIGGER on_auth_user_created_before
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_user();
