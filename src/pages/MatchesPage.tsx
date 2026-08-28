import { useState } from 'react';
import { CalendarDays, Clock, Filter, Play, Swords, Trophy } from 'lucide-react';
import { PageTitle, MetricCard, SectionHeader, LoadingState } from '@/components/AdminLayout';
import { useLeagueData } from '@/lib/useLeagueData';
import type { MatchWithPlayers } from '@/lib/useLeagueData';
import type { MatchStatus } from '@/lib/types';

const STATUS_LABELS_AR: Record<MatchStatus, string> = {
  SCHEDULED: 'مجدول',
  READY: 'جاهز',
  IN_PROGRESS: 'مباشر',
  RESULT_SUBMISSION: 'بانتظار النتيجة',
  COMPLETED: 'مكتمل',
  DISPUTED: 'نزاع',
};

const STATUS_COLORS: Record<MatchStatus, string> = {
  SCHEDULED: 'text-slate-400 bg-slate-500/10',
  READY: 'text-amber-400 bg-amber-500/10',
  IN_PROGRESS: 'text-red-400 bg-red-500/10',
  RESULT_SUBMISSION: 'text-cyan-400 bg-cyan-500/10',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10',
  DISPUTED: 'text-rose-400 bg-rose-500/10',
};

function MatchRow({ match }: { match: MatchWithPlayers }) {
  const home = match.home_player;
  const away = match.away_player;
  const status = match.status as MatchStatus;
  const hasScore = match.home_score !== null && match.away_score !== null;

  return (
    <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4 last:border-0 sm:gap-5">
      <div className="w-24 shrink-0 text-center">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-300">
          <Clock className="h-3 w-3" />
          {match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS_AR[status]}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="text-xs font-bold text-slate-200">{home?.username ?? 'TBD'}</span>
        {home?.avatar_url && <img src={home.avatar_url} alt="" className="h-7 w-7 rounded-lg" />}
      </div>
      <div className="flex min-w-[56px] items-center justify-center rounded-lg bg-white/[0.04] px-3 py-1.5 font-mono text-sm font-black text-white">
        {hasScore ? (
          <>
            <span className="text-emerald-300">{match.home_score}</span>
            <span className="mx-1 text-slate-600">:</span>
            <span className="text-rose-300">{match.away_score}</span>
          </>
        ) : (
          <span className="text-slate-600">VS</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {away?.avatar_url && <img src={away.avatar_url} alt="" className="h-7 w-7 rounded-lg" />}
        <span className="text-xs font-bold text-slate-200">{away?.username ?? 'TBD'}</span>
      </div>
      <div className="hidden shrink-0 items-center gap-1 text-[10px] font-bold text-slate-600 sm:flex">
        <CalendarDays className="h-3 w-3" />
        ج{match.round_number}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const { matches, loading } = useLeagueData();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  if (loading) return <LoadingState />;

  const completed = matches.filter((m) => m.status === 'COMPLETED');
  const upcoming = matches.filter((m) => m.status === 'READY' || m.status === 'SCHEDULED');
  const live = matches.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'RESULT_SUBMISSION' || m.status === 'DISPUTED');

  const filtered = filter === 'upcoming' ? upcoming : filter === 'completed' ? completed : matches;

  return (
    <div className="animate-slide-up">
      <PageTitle
        eyebrow="مركز المباريات"
        title="إدارة المباريات"
        description="عرض وإدارة جميع مباريات البطولة"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="مباريات جاهزة" value={String(upcoming.length)} icon={Play} tone="amber" />
        <MetricCard label="مباريات مباشرة" value={String(live.length)} icon={Swords} tone="rose" />
        <MetricCard label="مباريات مكتملة" value={String(completed.length)} icon={Trophy} tone="emerald" />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${filter === f ? 'bg-sky-500/10 text-sky-300' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {f === 'all' ? 'الكل' : f === 'upcoming' ? 'القادمة' : 'المكتملة'}
          </button>
        ))}
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-5">
          <SectionHeader title={filter === 'upcoming' ? 'المباريات القادمة' : filter === 'completed' ? 'النتائج' : 'جميع المباريات'} />
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">لا توجد مباريات</div>
        ) : (
          filtered.map((match) => <MatchRow key={match.id} match={match} />)
        )}
      </div>
    </div>
  );
}
