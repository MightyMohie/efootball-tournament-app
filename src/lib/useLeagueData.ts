import { useEffect, useState } from 'react';
import { supabase, LEAGUE_ID } from '@/lib/supabase';
import type { Club, Player, Match, Dispute, League } from '@/lib/types';

export interface MatchWithPlayers extends Match {
  home_player: Player | null;
  away_player: Player | null;
}

export interface DisputeWithMatch extends Dispute {
  match: MatchWithPlayers | null;
}

export interface LeagueData {
  league: League | null;
  clubs: Club[];
  players: Player[];
  matches: MatchWithPlayers[];
  disputes: DisputeWithMatch[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLeagueData(): LeagueData {
  const [league, setLeague] = useState<League | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [disputes, setDisputes] = useState<DisputeWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setError(null);
    try {
      const [leagueRes, clubsRes, playersRes, matchesRes, disputesRes] = await Promise.all([
        supabase.from('leagues').select('*').eq('id', LEAGUE_ID).single(),
        supabase.from('clubs').select('*').eq('league_id', LEAGUE_ID).order('created_at'),
        supabase.from('players').select('*').eq('league_id', LEAGUE_ID).order('points', { ascending: false }),
        supabase.from('matches').select('*, home_player:players!home_player_id(*), away_player:players!away_player_id(*)').eq('league_id', LEAGUE_ID).order('round_number').order('scheduled_at'),
        supabase.from('disputes').select('*, match:matches(*, home_player:players!home_player_id(*), away_player:players!away_player_id(*)').eq('status', 'open'),
      ]);

      if (leagueRes.data) setLeague(leagueRes.data as League);
      if (clubsRes.data) setClubs(clubsRes.data as Club[]);
      if (playersRes.data) setPlayers(playersRes.data as Player[]);
      if (matchesRes.data) setMatches(matchesRes.data as unknown as MatchWithPlayers[]);
      if (disputesRes.data) setDisputes(disputesRes.data as unknown as DisputeWithMatch[]);

      if (leagueRes.error) setError(leagueRes.error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { league, clubs, players, matches, disputes, loading, error, refresh: fetchAll };
}
