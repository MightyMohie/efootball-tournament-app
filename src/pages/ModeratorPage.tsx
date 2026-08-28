import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Gavel, ShieldAlert, XCircle } from 'lucide-react';
import { PageTitle, MetricCard, LoadingState } from '@/components/AdminLayout';
import { useLeagueData } from '@/lib/useLeagueData';
import { supabase } from '@/lib/supabase';
import type { DisputeWithMatch } from '@/lib/useLeagueData';

function DisputeCard({ dispute, onResolve }: { dispute: DisputeWithMatch; onResolve: () => void }) {
  const [resolution, setResolution] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = dispute.match;

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolution.trim()) {
      setError('يرجى كتابة قرار الحل');
      return;
    }
    setSubmitting(true);
    setError(null);

    const hs = homeScore ? parseInt(homeScore, 10) : match?.home_score ?? null;
    const as = awayScore ? parseInt(awayScore, 10) : match?.away_score ?? null;

    const { error: disputeError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution: resolution.trim(),
        resolved_home_score: hs,
        resolved_away_score: as,
        resolved_by: 'admin',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', dispute.id);

    if (disputeError) {
      setError(disputeError.message);
      setSubmitting(false);
      return;
    }

    if (match && hs !== null && as !== null) {
      const winnerId = hs > as ? match.home_player_id : as > hs ? match.away_player_id : null;
      await supabase
        .from('matches')
        .update({ home_score: hs, away_score: as, winner_id: winnerId, status: 'COMPLETED' })
        .eq('id', match.id);
    }

    await onResolve();
    setSubmitting(false);
    setResolution('');
    setHomeScore('');
    setAwayScore('');
  };

  return (
    <div className="glass-panel overflow-hidden border-rose-500/20">
      <div className="flex items-center gap-3 border-b border-slate-800 bg-rose-500/5 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-black text-white">
            {match?.home_player?.username ?? 'TBD'} ضد {match?.away_player?.username ?? 'TBD'}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            النتيجة المسجلة: {match?.home_score ?? '—'} : {match?.away_score ?? '—'}
          </div>
        </div>
        <span className="rounded-md bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-400">مفتوح</span>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-300">{dispute.reason}</p>

        <form onSubmit={handleResolve} className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400">النتيجة النهائية:</label>
            <input
              type="number"
              min="0"
              max="99"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder={String(match?.home_score ?? '')}
              className="w-14 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-center text-sm font-black text-white focus:border-sky-500/40 focus:outline-none"
            />
            <span className="text-xs text-slate-600">:</span>
            <input
              type="number"
              min="0"
              max="99"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder={String(match?.away_score ?? '')}
              className="w-14 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-center text-sm font-black text-white focus:border-sky-500/40 focus:outline-none"
            />
          </div>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="اكتب قرار الحل هنا..."
            rows={2}
            className="input-field resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-xs">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? 'جاري الحل...' : 'حل النزاع'}
            </button>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default function ModeratorPage() {
  const { disputes, loading, refresh } = useLeagueData();
  const [showResolved, setShowResolved] = useState(false);

  if (loading) return <LoadingState />;

  const openDisputes = disputes.filter((d) => d.status === 'open');

  return (
    <div className="animate-slide-up">
      <PageTitle eyebrow="قائمة المشرفين" title="لوحة المشرف" description="مراجعة وحل نزاعات المباريات" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="نزاعات مفتوحة" value={String(openDisputes.length)} icon={ShieldAlert} tone="rose" />
        <MetricCard label="نزاعات محلولة" value={String(disputes.filter((d) => d.status === 'resolved').length)} icon={CheckCircle2} tone="emerald" />
        <MetricCard label="إجمالي النزاعات" value={String(disputes.length)} icon={Gavel} tone="amber" />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setShowResolved(false)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${!showResolved ? 'bg-rose-500/10 text-rose-300' : 'text-slate-500 hover:text-slate-300'}`}
        >
          المفتوحة ({openDisputes.length})
        </button>
        <button
          onClick={() => setShowResolved(true)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${showResolved ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-500 hover:text-slate-300'}`}
        >
          المحلولة ({disputes.filter((d) => d.status === 'resolved').length})
        </button>
      </div>

      {showResolved ? (
        <div className="space-y-4">
          {disputes.filter((d) => d.status === 'resolved').length === 0 ? (
            <div className="glass-panel px-5 py-12 text-center text-sm text-slate-500">لا توجد نزاعات محلولة</div>
          ) : (
            disputes.filter((d) => d.status === 'resolved').map((d) => (
              <div key={d.id} className="glass-panel p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{d.match?.home_player?.username} ضد {d.match?.away_player?.username}</div>
                    <div className="mt-1 text-xs text-slate-400">{d.resolution}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {openDisputes.length === 0 ? (
            <div className="glass-panel px-5 py-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <p className="mt-3 text-sm text-slate-400">لا توجد نزاعات مفتوحة</p>
            </div>
          ) : (
            openDisputes.map((d) => <DisputeCard key={d.id} dispute={d} onResolve={refresh} />)
          )}
        </div>
      )}
    </div>
  );
}
