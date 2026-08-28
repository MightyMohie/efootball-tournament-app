import { Crown, Medal, TrendingUp } from 'lucide-react';
import { PageTitle, LoadingState } from '@/components/AdminLayout';
import { useLeagueData } from '@/lib/useLeagueData';
import type { Player, Club } from '@/lib/types';

function StandingsRow({ player, club, rank }: { player: Player; club: Club | undefined; rank: number }) {
  const gd = player.goals_for - player.goals_against;
  const medalColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-slate-600';

  return (
    <tr className="border-b border-slate-800 last:border-0 hover:bg-white/[0.02]">
      <td className="px-4 py-3.5 text-center">
        {rank <= 3 ? (
          <Medal className={`mx-auto h-4 w-4 ${medalColor}`} />
        ) : (
          <span className="text-xs font-bold text-slate-600">{rank}</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          {player.avatar_url && <img src={player.avatar_url} alt="" className="h-8 w-8 rounded-lg" />}
          <div>
            <div className="text-sm font-bold text-white">{player.username}</div>
            {player.gamer_id && <div className="text-[10px] text-slate-500">{player.gamer_id}</div>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        {club ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: club.primary_color }} />
            <span className="text-xs font-semibold text-slate-300">{club.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-600">بدون نادٍ</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-white">{player.played}</td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-emerald-400">{player.wins}</td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-amber-400">{player.draws}</td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-rose-400">{player.losses}</td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-slate-300">{player.goals_for}:{player.goals_against}</td>
      <td className="px-4 py-3.5 text-center text-sm font-bold text-slate-300">{gd > 0 ? `+${gd}` : gd}</td>
      <td className="px-4 py-3.5 text-center">
        <span className="text-base font-black text-sky-400">{player.points}</span>
      </td>
    </tr>
  );
}

export default function StandingsPage() {
  const { players, clubs, loading } = useLeagueData();

  if (loading) return <LoadingState />;

  const sorted = [...players].sort((a, b) => b.points - a.points || b.wins - a.wins || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against));

  return (
    <div className="animate-slide-up">
      <PageTitle eyebrow="الترتيب" title="جدول الترتيب" description="ترتيب اللاعبين في الموسم الحالي" />

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{sorted[0]?.username ?? '—'}</span>
          <span className="text-xs text-amber-500/60">المتصدر</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-2.5">
          <TrendingUp className="h-4 w-4 text-sky-400" />
          <span className="text-xs text-slate-400">{sorted.length} لاعب</span>
        </div>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500">
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-right">اللاعب</th>
              <th className="px-4 py-3 text-right">النادي</th>
              <th className="px-4 py-3 text-center">لعب</th>
              <th className="px-4 py-3 text-center">فوز</th>
              <th className="px-4 py-3 text-center">تعادل</th>
              <th className="px-4 py-3 text-center">خسارة</th>
              <th className="px-4 py-3 text-center">الأهداف</th>
              <th className="px-4 py-3 text-center">فرق</th>
              <th className="px-4 py-3 text-center">نقاط</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => (
              <StandingsRow key={player.id} player={player} club={clubs.find((c) => c.id === player.club_id)} rank={i + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
