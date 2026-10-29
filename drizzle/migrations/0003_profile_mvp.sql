ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS x_url text,
  ADD COLUMN IF NOT EXISTS avatar_path text,
  ADD COLUMN IF NOT EXISTS banner_path text,
  ADD COLUMN IF NOT EXISTS display_name_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS username_changed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_ci_idx ON public.profiles (lower(username));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS clippza_profile_fields;
ALTER TABLE public.profiles ADD CONSTRAINT clippza_profile_fields CHECK(
  (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$')
  AND length(bio) <= 160
  AND public.valid_public_link(website_url) AND public.valid_public_link(tiktok_url) AND public.valid_public_link(instagram_url) AND public.valid_public_link(youtube_url) AND public.valid_public_link(x_url)
  AND length(coalesce(website_url,'')||coalesce(tiktok_url,'')||coalesce(instagram_url,'')||coalesce(youtube_url,'')||coalesce(x_url,'')) <= 1500
  AND (avatar_path IS NULL OR avatar_path LIKE id::text || '/%')
  AND (banner_path IS NULL OR banner_path LIKE id::text || '/%'));
CREATE OR REPLACE FUNCTION public.guard_profile() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF new.id IS DISTINCT FROM old.id OR new.created_at IS DISTINCT FROM old.created_at THEN RAISE EXCEPTION 'Profile identity is immutable'; END IF;
  new.display_name_changed_at := old.display_name_changed_at;
  new.username_changed_at := old.username_changed_at;
  new.display_name := left(trim(new.display_name), 60);
  IF new.username IS NOT NULL THEN new.username := nullif(lower(regexp_replace(trim(new.username), '^@', '')), ''); END IF;
  new.bio := trim(coalesce(new.bio, ''));
  IF new.display_name IS DISTINCT FROM old.display_name THEN
    IF length(new.display_name) < 2 THEN RAISE EXCEPTION 'Display name must be at least 2 characters'; END IF;
    IF old.display_name_changed_at IS NOT NULL AND old.display_name_changed_at > now() - interval '7 days' THEN
      RAISE EXCEPTION 'Display name can be changed once every 7 days'; END IF;
    new.display_name_changed_at := now();
  END IF;
  IF new.username IS DISTINCT FROM old.username THEN
    IF new.username IS NULL THEN RAISE EXCEPTION 'Username cannot be removed'; END IF;
    IF old.username_changed_at IS NOT NULL AND old.username_changed_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Username can be changed once every 30 days'; END IF;
    new.username_changed_at := now();
  END IF;
  RETURN new;
END $$;
REVOKE ALL ON FUNCTION public.guard_profile() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS clippza_profile_guard ON public.profiles;
CREATE TRIGGER clippza_profile_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile();
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(display_name, username, bio, website_url, tiktok_url, instagram_url, youtube_url, x_url, avatar_path, banner_path) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS profile_media_read ON storage.objects;
DROP POLICY IF EXISTS profile_media_insert ON storage.objects;
DROP POLICY IF EXISTS profile_media_update ON storage.objects;
DROP POLICY IF EXISTS profile_media_delete ON storage.objects;
CREATE POLICY profile_media_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY profile_media_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE POLICY profile_media_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE POLICY profile_media_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);