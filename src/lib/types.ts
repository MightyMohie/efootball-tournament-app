export type LeaguePhase = 'registration' | 'group' | 'knockout' | 'finals' | 'completed';
export type MatchStatus =
  | 'SCHEDULED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'RESULT_SUBMISSION'
  | 'COMPLETED'
  | 'DISPUTED';
export type MatchPhase = 'group' | 'knockout' | 'finals';
export type DisputeStatus = 'open' | 'resolved';

export interface League {
  id: string;
  name: string;
  season: string;
  phase: LeaguePhase;
  current_round: number;
  config: {
    matchWindowMinutes?: number;
    pointsWin?: number;
    pointsDraw?: number;
    pointsLoss?: number;
  };
  created_at: string;
}

export interface Club {
  id: string;
  league_id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  primary_color: string;
  reserved: boolean;
  created_at: string;
}

export interface Player {
  id: string;
  username: string;
  avatar_url: string | null;
  gamer_id: string | null;
  club_id: string | null;
  league_id: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  played: number;
  created_at: string;
}

export interface Match {
  id: string;
  league_id: string;
  round_number: number;
  phase: MatchPhase;
  status: MatchStatus;
  scheduled_at: string | null;
  start_time: string | null;
  end_time: string | null;
  home_player_id: string | null;
  away_player_id: string | null;
  home_score: number | null;
  away_score: number | null;
  winner_id: string | null;
  home_ready: boolean;
  away_ready: boolean;
  created_at: string;
}

export interface MatchWithRelations extends Match {
  home_player?: Player | null;
  away_player?: Player | null;
}

export interface Evidence {
  id: string;
  match_id: string;
  submitter_id: string | null;
  screenshot_url: string;
  home_score: number;
  away_score: number;
  note: string | null;
  verified: boolean;
  submitted_at: string;
}

export interface EvidenceWithRelations extends Evidence {
  submitter?: Player | null;
}

export interface Dispute {
  id: string;
  match_id: string;
  raised_by: string | null;
  reason: string;
  status: DisputeStatus;
  resolution: string | null;
  resolved_home_score: number | null;
  resolved_away_score: number | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface DisputeWithRelations extends Dispute {
  match?: MatchWithRelations | null;
  raised_by_player?: Player | null;
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Scheduled',
  READY: 'Ready',
  IN_PROGRESS: 'Live',
  RESULT_SUBMISSION: 'Result Pending',
  COMPLETED: 'Completed',
  DISPUTED: 'Disputed',
};

export const STATUS_COLORS: Record<MatchStatus, string> = {
  SCHEDULED: 'text-slate-400',
  READY: 'text-amber-400',
  IN_PROGRESS: 'text-red-400',
  RESULT_SUBMISSION: 'text-cyan-400',
  COMPLETED: 'text-emerald-400',
  DISPUTED: 'text-rose-400',
};

export const STATUS_DOT: Record<MatchStatus, string> = {
  SCHEDULED: 'bg-slate-500',
  READY: 'bg-amber-500',
  IN_PROGRESS: 'bg-red-500 animate-pulse',
  RESULT_SUBMISSION: 'bg-cyan-500',
  COMPLETED: 'bg-emerald-500',
  DISPUTED: 'bg-rose-500',
};

export const PHASE_LABELS: Record<LeaguePhase, string> = {
  registration: 'Registration',
  group: 'Group Stage',
  knockout: 'Knockout',
  finals: 'Finals',
  completed: 'Completed',
};
