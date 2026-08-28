/*
# Fix profiles trigger: handle gamer_tag conflicts and trim whitespace

## Problem
The `handle_new_user` trigger fails with "Database error saving new user" when:
1. A new user signs up with a gamer_tag that already exists (unique constraint violation)
2. The gamer_tag has leading/trailing whitespace (e.g. "Mightymohy " was stored with a trailing space)

The original `ON CONFLICT (id) DO NOTHING` only handled id conflicts, not gamer_tag conflicts.

## Fix
1. Trim whitespace from the gamer_tag before inserting
2. If the trimmed gamer_tag already exists, append a random 4-character suffix to make it unique
3. Keep `ON CONFLICT (id) DO NOTHING` for idempotency

## Security
No security changes — the function remains SECURITY DEFINER owned by postgres.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gamer_tag text;
BEGIN
  v_gamer_tag := COALESCE(NEW.raw_user_meta_data->>'gamer_tag', split_part(NEW.email, '@', 1));
  v_gamer_tag := btrim(v_gamer_tag);

  IF v_gamer_tag = '' THEN
    v_gamer_tag := split_part(NEW.email, '@', 1);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE gamer_tag = v_gamer_tag) THEN
    v_gamer_tag := v_gamer_tag || '_' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (id, email, gamer_tag)
  VALUES (NEW.id, NEW.email, v_gamer_tag)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
