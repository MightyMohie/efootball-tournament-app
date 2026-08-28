import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, ChevronLeft, Play, Shield, Trophy, Users, Zap, Loader2 } from 'lucide-react';
import { PageTitle, MetricCard, SectionHeader, ViewMoreButton } from '@/components/AdminLayout';
import { useLeagueData, type MatchWithPlayers } from '@/lib/useLeagueData';
import type { Club, Player } from '@/lib/types';

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status: string): string {
  switch (status) {
    case 'READY': return 'جاهز';
    case 'SCHEDULED': return 'مجدول';
    case 'IN_PROGRESS': return 'مباشر';
    case 'COMPLETED': return 'انتهت';
    case 'RESULT_SUBMISSION': return 'بانتظار النتيجة';
    case 'DISPUTED': return 'نزاع';
    default: return status;
  }
}

function playerLabel(player: Player | null, clubs: Club[]): { name: string; color: string } {
  if (!player) return { name: '—', color: '#1e293b' };
  const club = clubs.find((c) => c.id === player.club_id);
  return {
    name: player.username,
    color: club?.primary_color ?? '#1e293b',
  };
}

export default function DashboardPage() {
  const { league, clubs, players, matches, disputes, loading, error } = useLeagueData();

  const activePlayers = players.length;
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED').length;
  const reservedClubs = clubs.filter((c) => c.reserved).length;
  const totalClubs = clubs.length;
  const openDisputes = disputes.length;

  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'READY')
    .sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''))
    .slice(0, 4);

  const recentResults = matches
    .filter((m) => m.status === 'COMPLETED' && m.home_score !== null && m.away_score !== null)
    .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
    .slice(0, 4);

  const currentRound = league?.current_round ?? 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageTitle
        eyebrow="نظرة عامة على البطولة"
        title="لوحة التحكم"
        description={league ? `${league.name} — ${league.season} — الجولة ${currentRound}` : 'ملخص أحداث البطولة'}
        action={<Link to="/admin/matches" className="btn-primary w-full sm:w-auto"><Play className="h-4 w-4" fill="currentColor" />افتح مركز المباريات</Link>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="اللاعبين النشطين" value={String(activePlayers)} detail="مسجلين هذا الموسم" icon={Users} tone="sky" />
        <MetricCard label="مباريات ملعوبة" value={String(completedMatches)} detail={`الجولة ${currentRound} جارية`} icon={Trophy} tone="emerald" />
        <MetricCard label="الأندية المتاحة" value={`${reservedClubs}/${totalClubs}`} detail="حجوزات مكتملة" icon={Shield} tone="amber" />
        <MetricCard label="يحتاج انتباهك" value={String(openDisputes)} detail="نزاعات تحتاج لمراجعة" icon={Zap} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="glass-panel overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-5"><SectionHeader title="المباريات القادمة" action={<ViewMoreButton to="/admin/matches" />} /></div>
          {upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">لا توجد مباريات قادمة</div>
          ) : (
            upcoming.map((match: MatchWithPlayers) => {
              const home = playerLabel(match.home_player, clubs);
              const away = playerLabel(match.away_player, clubs);
              return (
                <div key={match.id} className="flex items-center gap-3 border-b border-slate-800 px-5 py-4 last:border-0 sm:gap-5">
                  <div className="w-20 shrink-0 text-center">
                    <div className="text-xs font-bold text-slate-300">{formatTime(match.scheduled_at)}</div>
                    <div className={`mt-1 text-[10px] font-bold ${match.status === 'READY' ? 'text-amber-400' : 'text-slate-500'}`}>{statusLabel(match.status)}</div>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <TeamBadge name={home.name} color={home.color} />
                  </div>
                  <div className="flex min-w-[48px] items-center justify-center rounded-lg bg-white/[0.04] px-2 py-1.5 text-xs font-black text-slate-500">VS</div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <TeamBadge name={away.name} color={away.color} />
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="glass-panel overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-5"><SectionHeader title="أحدث النتائج" action={<ViewMoreButton to="/admin/matches" />} /></div>
          {recentResults.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">لا توجد نتائج بعد</div>
          ) : (
            recentResults.map((match: MatchWithPlayers) => {
              const home = playerLabel(match.home_player, clubs);
              const away = playerLabel(match.away_player, clubs);
              return (
                <div key={match.id} className="border-b border-slate-800 px-5 py-4 last:border-0">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <CalendarDays className="h-3 w-3" />
                    {`الجولة ${match.round_number} — ${match.phase === 'group' ? 'مجموعة' : match.phase === 'knockout' ? 'خروج' : 'نهائي'}`}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-200">{home.name}</span>
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 font-mono text-sm font-black text-white">
                      <span className="text-emerald-300">{match.home_score}</span>
                      <span className="text-slate-600">:</span>
                      <span className="text-rose-300">{match.away_score}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">{away.name}</span>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {openDisputes > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold">{openDisputes === 1 ? 'يوجد نزاع واحد يحتاج إلى مراجعة المشرف' : `${openDisputes} نزاعات تحتاج إلى مراجعة المشرف`}</span>
          <Link to="/admin/moderator" className="mr-2 flex items-center gap-1 font-bold text-rose-200 hover:text-white">مراجعة الآن<ChevronLeft className="h-3.5 w-3.5" /></Link>
        </div>
      )}
    </div>
  );
}

function TeamBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[8px] font-black text-white shadow ring-1 ring-white/10" style={{ backgroundColor: color }}>
        {name.slice(0, 3).toUpperCase()}
      </div>
      <span className="text-xs font-bold text-slate-200">{name}</span>
    </div>
  );
}
