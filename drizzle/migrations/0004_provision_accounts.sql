CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE r text := new.raw_user_meta_data->>'role';
BEGIN
  INSERT INTO public.profiles(id, display_name)
  VALUES (new.id, left(trim(coalesce(new.raw_user_meta_data->>'display_name','')), 60))
  ON CONFLICT (id) DO NOTHING;
  IF r IN ('client','clipper') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (new.id, r::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN new;
END $function$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS clippza_signup ON auth.users;
CREATE TRIGGER clippza_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
INSERT INTO public.profiles(id, display_name)
SELECT u.id, left(trim(coalesce(u.raw_user_meta_data->>'display_name','')), 60)
FROM auth.users u WHERE u.raw_user_meta_data->>'role' IN ('client','clipper')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles(user_id, role)
SELECT u.id, (u.raw_user_meta_data->>'role')::public.app_role
FROM auth.users u WHERE u.raw_user_meta_data->>'role' IN ('client','clipper')
ON CONFLICT (user_id, role) DO NOTHING;