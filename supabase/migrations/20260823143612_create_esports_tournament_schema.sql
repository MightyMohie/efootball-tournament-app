/*
# Esports Tournament Management Schema

## Overview
Full schema for a competitive mobile football gaming tournament platform.
Single-tenant (no auth) — all data is shared/public so the anon-key client can read/write.
The app distinguishes "player portal" vs "moderator command center" views in the UI.

## New Tables
1. `leagues` — tournament seasons with multi-phase progression
2. `clubs` — football clubs/teams that can be reserved
3. `players` — competitor profiles + standings aggregates
4. `matches` — fixtures with live state tracking
5. `evidence` — match screenshot submissions from the player portal
6. `disputes` — score disputes for moderator resolution

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because this
  is a single-tenant, intentionally-public app (no sign-in screen). Documented per policy.

## Notes
- `players.club_id` is the exclusive reservation lock — one player to one club.
- `matches.status` drives the live lobby state machine.
- Standings are derived from `players` aggregate columns.
*/

-- ============================================================
-- LEAGUES
-- ============================================================
CREATE TABLE IF NOT EXISTS leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  season text NOT NULL,
  phase text NOT NULL DEFAULT 'registration'
    CHECK (phase IN ('registration','group','knockout','finals','completed')),
  current_round integer NOT NULL DEFAULT 1,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_leagues" ON leagues;
CREATE POLICY "anon_read_leagues" ON leagues FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leagues" ON leagues;
CREATE POLICY "anon_insert_leagues" ON leagues FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leagues" ON leagues;
CREATE POLICY "anon_update_leagues" ON leagues FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leagues" ON leagues;
CREATE POLICY "anon_delete_leagues" ON leagues FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- CLUBS
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#1e293b',
  reserved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_clubs" ON clubs;
CREATE POLICY "anon_read_clubs" ON clubs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clubs" ON clubs;
CREATE POLICY "anon_insert_clubs" ON clubs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clubs" ON clubs;
CREATE POLICY "anon_update_clubs" ON clubs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clubs" ON clubs;
CREATE POLICY "anon_delete_clubs" ON clubs FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- PLAYERS
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  avatar_url text,
  gamer_id text,
  club_id uuid UNIQUE REFERENCES clubs(id) ON DELETE SET NULL,
  league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  played integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_players" ON players;
CREATE POLICY "anon_read_players" ON players FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_players" ON players;
CREATE POLICY "anon_insert_players" ON players FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_players" ON players;
CREATE POLICY "anon_update_players" ON players FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_players" ON players;
CREATE POLICY "anon_delete_players" ON players FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  phase text NOT NULL DEFAULT 'group'
    CHECK (phase IN ('group','knockout','finals')),
  status text NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','READY','IN_PROGRESS','RESULT_SUBMISSION','COMPLETED','DISPUTED')),
  scheduled_at timestamptz,
  start_time timestamptz,
  end_time timestamptz,
  home_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  away_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  home_score integer,
  away_score integer,
  winner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  home_ready boolean NOT NULL DEFAULT false,
  away_ready boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_matches" ON matches;
CREATE POLICY "anon_read_matches" ON matches FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_matches" ON matches;
CREATE POLICY "anon_insert_matches" ON matches FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_matches" ON matches;
CREATE POLICY "anon_update_matches" ON matches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_matches" ON matches;
CREATE POLICY "anon_delete_matches" ON matches FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(league_id, round_number);

-- ============================================================
-- EVIDENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  submitter_id uuid REFERENCES players(id) ON DELETE SET NULL,
  screenshot_url text NOT NULL,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  note text,
  verified boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_evidence" ON evidence;
CREATE POLICY "anon_read_evidence" ON evidence FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_evidence" ON evidence;
CREATE POLICY "anon_insert_evidence" ON evidence FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_evidence" ON evidence;
CREATE POLICY "anon_update_evidence" ON evidence FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_evidence" ON evidence;
CREATE POLICY "anon_delete_evidence" ON evidence FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  raised_by uuid REFERENCES players(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','resolved')),
  resolution text,
  resolved_home_score integer,
  resolved_away_score integer,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_disputes" ON disputes;
CREATE POLICY "anon_read_disputes" ON disputes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_disputes" ON disputes;
CREATE POLICY "anon_insert_disputes" ON disputes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_disputes" ON disputes;
CREATE POLICY "anon_update_disputes" ON disputes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_disputes" ON disputes;
CREATE POLICY "anon_delete_disputes" ON disputes FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO leagues (id, name, season, phase, current_round, config)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Pro Football Mobile League',
  'Season 7',
  'group',
  3,
  '{"matchWindowMinutes": 40, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clubs (id, league_id, name, short_name, logo_url, primary_color, reserved) VALUES
  ('a0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Crimson FC','CRF','https://api.dicebear.com/7.x/shields/svg?backgroundColor=b91c1c&text=CRF','#b91c1c',true),
  ('a0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Azure United','AZU','https://api.dicebear.com/7.x/shields/svg?backgroundColor=1d4ed8&text=AZU','#1d4ed8',true),
  ('a0000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Emerald Athletic','EMA','https://api.dicebear.com/7.x/shields/svg?backgroundColor=047857&text=EMA','#047857',true),
  ('a0000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Golden Galaxy','GGA','https://api.dicebear.com/7.x/shields/svg?backgroundColor=b45309&text=GGA','#b45309',true),
  ('a0000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Onyx Rovers','ONR','https://api.dicebear.com/7.x/shields/svg?backgroundColor=1f2937&text=ONR','#1f2937',false),
  ('a0000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','Cyan City','CCY','https://api.dicebear.com/7.x/shields/svg?backgroundColor=0e7490&text=CCY','#0e7490',false),
  ('a0000000-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','Crimson Wolves','CWO','https://api.dicebear.com/7.x/shields/svg?backgroundColor=9f1239&text=CWO','#9f1239',false),
  ('a0000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','Steel Titans','STT','https://api.dicebear.com/7.x/shields/svg?backgroundColor=52525b&text=STT','#52525b',false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO players (id, username, avatar_url, gamer_id, club_id, league_id, points, wins, draws, losses, goals_for, goals_against, played) VALUES
  ('b0000000-0000-0000-0000-000000000001','StrikerX','https://api.dicebear.com/7.x/avataaars/svg?seed=StrikerX&backgroundColor=b91c1c','GM-STR01','a0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',9,3,0,0,8,2,3),
  ('b0000000-0000-0000-0000-000000000002','NeyBotz','https://api.dicebear.com/7.x/avataaars/svg?seed=NeyBotz&backgroundColor=1d4ed8','GM-NEY02','a0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',7,2,1,0,6,3,3),
  ('b0000000-0000-0000-0000-000000000003','DribbleKing','https://api.dicebear.com/7.x/avataaars/svg?seed=DribbleKing&backgroundColor=047857','GM-DRB03','a0000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',4,1,1,1,4,4,3),
  ('b0000000-0000-0000-0000-000000000004','GoalMachine','https://api.dicebear.com/7.x/avataaars/svg?seed=GoalMachine&backgroundColor=b45309','GM-GOL04','a0000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',3,1,0,2,3,5,3),
  ('b0000000-0000-0000-0000-000000000005','TikiTaka','https://api.dicebear.com/7.x/avataaars/svg?seed=TikiTaka&backgroundColor=1f2937','GM-TIK05',NULL,'11111111-1111-1111-1111-111111111111',0,0,0,0,0,0,0),
  ('b0000000-0000-0000-0000-000000000006','WallKeeper','https://api.dicebear.com/7.x/avataaars/svg?seed=WallKeeper&backgroundColor=0e7490','GM-WAL06',NULL,'11111111-1111-1111-1111-111111111111',0,0,0,0,0,0,0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO matches (id, league_id, round_number, phase, status, scheduled_at, home_player_id, away_player_id, home_score, away_score, winner_id, home_ready, away_ready) VALUES
  ('c0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',1,'group','COMPLETED', now() - interval '6 days','b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000004',3,1,'b0000000-0000-0000-0000-000000000001',true,true),
  ('c0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',1,'group','COMPLETED', now() - interval '6 days','b0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003',2,2,NULL,true,true),
  ('c0000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',2,'group','COMPLETED', now() - interval '3 days','b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003',3,1,'b0000000-0000-0000-0000-000000000001',true,true),
  ('c0000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',2,'group','COMPLETED', now() - interval '3 days','b0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000004',2,1,'b0000000-0000-0000-0000-000000000002',true,true),
  ('c0000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111',3,'group','READY', now() + interval '2 hours','b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002',NULL,NULL,NULL,true,false),
  ('c0000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111',3,'group','SCHEDULED', now() + interval '5 hours','b0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000004',NULL,NULL,NULL,false,false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO evidence (id, match_id, submitter_id, screenshot_url, home_score, away_score, verified) VALUES
  ('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1517649763962-0c6230669884?w=900',3,1,true),
  ('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1551958219-5b568a2159d9?w=900',2,2,true),
  ('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900',3,1,true),
  ('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1487462905682-3c64d0625723?w=900',2,1,true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO disputes (id, match_id, raised_by, reason, status, resolution, resolved_by, resolved_at) VALUES
  ('e0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000004','Opponent claims 2-1 but screenshot shows lag disconnect at 1-1. Requesting moderator review of final score.','open',NULL,NULL,NULL)
ON CONFLICT (id) DO NOTHING;
