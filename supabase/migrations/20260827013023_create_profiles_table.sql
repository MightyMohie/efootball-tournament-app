/*
# Create profiles table for Supabase Auth integration

## Overview
Adds a `profiles` table that extends Supabase's built-in `auth.users` with
application-specific data (gamer tag). A trigger automatically creates a
profile row whenever a new auth user signs up, so the frontend never needs
to insert into `profiles` manually.

## New Tables
1. `profiles`
   - `id` (uuid, primary key, references `auth.users.id` ON DELETE CASCADE)
   - `email` (text, not null) — denormalized from auth.users for convenience
   - `gamer_tag` (text, not null, unique) — the player's display name
   - `role` (text, default 'player') — future role-based access (player/admin/moderator)
   - `created_at` (timestamptz, default now())

## Security
- RLS enabled on `profiles`.
- SELECT: authenticated users can read all profiles (needed for standings, match opponent names).
- INSERT: blocked for all clients — rows are created only by the server-side trigger.
- UPDATE: users can update only their own profile (e.g. change gamer_tag).
- DELETE: blocked for all clients — profiles are cascade-deleted when the auth user is deleted.

## Trigger
- `handle_new_user` function + `on_auth_user_created` trigger: inserts a
  `profiles` row automatically when a new auth user signs up. The email and
  a default gamer_tag are copied from `auth.users`.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  gamer_tag text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'player'
    CHECK (role IN ('player','admin','moderator')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- No INSERT or DELETE policies: profiles are managed exclusively by the trigger.

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, gamer_tag)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gamer_tag', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
