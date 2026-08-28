import { useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Unlock } from 'lucide-react';
import { PageTitle, MetricCard, LoadingState } from '@/components/AdminLayout';
import { useLeagueData } from '@/lib/useLeagueData';
import { supabase } from '@/lib/supabase';
import type { Club, Player } from '@/lib/types';

function ClubCard({ club, player, onToggle }: { club: Club; player: Player | undefined; onToggle: () => void }) {
  return (
    <div className={`glass-panel-hover relative overflow-hidden p-5 ${club.reserved ? 'border-emerald-500/20' : ''}`}>
      {club.reserved && (
        <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg ring-1 ring-white/10" style={{ backgroundColor: club.primary_color }}>
            {club.short_name}
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{club.name}</h3>
            <p className="mt-0.5 text-[10px] text-slate-500">{club.reserved ? `محجوز بواسطة ${player?.username ?? '—'}` : 'متاح للحجز'}</p>
          </div>
        </div>
        {club.reserved ? (
          <Lock className="h-4 w-4 text-emerald-400" />
        ) : (
          <Unlock className="h-4 w-4 text-slate-600" />
        )}
      </div>
      <button
        onClick={onToggle}
        disabled={club.reserved && !player}
        className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
          club.reserved
            ? 'border border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10'
            : 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10'
        }`}
      >
        {club.reserved ? 'إلغاء الحجز' : 'حجز النادي'}
      </button>
    </div>
  );
}

export default function ClubsPage() {
  const { clubs, players, loading, refresh } = useLeagueData();
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return <LoadingState />;

  const reservedCount = clubs.filter((c) => c.reserved).length;

  const handleToggle = async (club: Club) => {
    setBusy(club.id);
    if (club.reserved) {
      await supabase.from('clubs').update({ reserved: false }).eq('id', club.id);
      if (club.id) {
        await supabase.from('players').update({ club_id: null }).eq('club_id', club.id);
      }
    } else {
      await supabase.from('clubs').update({ reserved: true }).eq('id', club.id);
    }
    await refresh();
    setBusy(null);
  };

  return (
    <div className="animate-slide-up">
      <PageTitle eyebrow="حجوزات الأندية" title="إدارة الأندية" description="حجز وإلغاء حجز الأندية للاعبين البطولة" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="أندية محجوزة" value={String(reservedCount)} icon={CheckCircle2} tone="emerald" />
        <MetricCard label="أندية متاحة" value={String(clubs.length - reservedCount)} icon={Unlock} tone="amber" />
        <MetricCard label="إجمالي الأندية" value={String(clubs.length)} icon={ShieldCheck} tone="sky" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {clubs.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            player={players.find((p) => p.club_id === club.id)}
            onToggle={() => handleToggle(club)}
          />
        ))}
      </div>
    </div>
  );
}
