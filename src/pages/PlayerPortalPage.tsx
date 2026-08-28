import { useState } from 'react';
import { Upload, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PageTitle, MetricCard, LoadingState } from '@/components/AdminLayout';
import { useLeagueData } from '@/lib/useLeagueData';
import { supabase, LEAGUE_ID } from '@/lib/supabase';
import type { MatchWithPlayers } from '@/lib/useLeagueData';

const STATUS_LABELS_AR: Record<string, string> = {
  SCHEDULED: 'مجدول',
  READY: 'جاهز',
  IN_PROGRESS: 'مباشر',
  RESULT_SUBMISSION: 'بانتظار النتيجة',
  COMPLETED: 'مكتمل',
  DISPUTED: 'نزاع',
};

function SubmitResultForm({ match, onSubmitted }: { match: MatchWithPlayers; onSubmitted: () => void }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hs = parseInt(homeScore, 10);
    const as = parseInt(awayScore, 10);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      setError('يرجى إدخال نتائج صحيحة');
      return;
    }
    setSubmitting(true);
    setError(null);

    const winnerId = hs > as ? match.home_player_id : as > hs ? match.away_player_id : null;

    const { error: matchError } = await supabase
      .from('matches')
      .update({
        home_score: hs,
        away_score: as,
        winner_id: winnerId,
        status: 'RESULT_SUBMISSION',
      })
      .eq('id', match.id);

    if (matchError) {
      setError(matchError.message);
      setSubmitting(false);
      return;
    }

    await onSubmitted();
    setSubmitting(false);
    setHomeScore('');
    setAwayScore('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <input
        type="number"
        min="0"
        max="99"
        value={homeScore}
        onChange={(e) => setHomeScore(e.target.value)}
        placeholder="0"
        className="w-14 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-center text-sm font-black text-white focus:border-sky-500/40 focus:outline-none"
      />
      <span className="text-xs text-slate-600">:</span>
      <input
        type="number"
        min="0"
        max="99"
        value={awayScore}
        onChange={(e) => setAwayScore(e.target.value)}
        placeholder="0"
        className="w-14 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-center text-sm font-black text-white focus:border-sky-500/40 focus:outline-none"
      />
      <button type="submit" disabled={submitting} className="btn-primary px-3 py-1.5 text-xs">
        {submitting ? 'جاري الإرسال...' : 'إرسال النتيجة'}
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </form>
  );
}

export default function PlayerPortalPage() {
  const { players, matches, loading, refresh } = useLeagueData();
  const [regUsername, setRegUsername] = useState('');
  const [regGamerId, setRegGamerId] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  const activeMatches = matches.filter((m) => m.status === 'READY' || m.status === 'IN_PROGRESS');
  const pendingResults = matches.filter((m) => m.status === 'RESULT_SUBMISSION');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regGamerId.trim()) {
      setRegError('يرجى ملء جميع الحقول');
      return;
    }
    setRegistering(true);
    setRegError(null);
    setRegSuccess(false);

    const { error } = await supabase.from('players').insert({
      username: regUsername.trim(),
      gamer_id: regGamerId.trim(),
      league_id: LEAGUE_ID,
    });

    if (error) {
      setRegError(error.code === '23505' ? 'اسم اللاعب أو المعرف مستخدم بالفعل' : error.message);
    } else {
      setRegSuccess(true);
      setRegUsername('');
      setRegGamerId('');
      await refresh();
    }
    setRegistering(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="animate-slide-up">
      <PageTitle eyebrow="بوابة اللاعبين" title="بوابة اللاعبين" description="تسجيل اللاعبين وإرسال نتائج المباريات" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="إجمالي اللاعبين" value={String(players.length)} icon={UserPlus} tone="sky" />
        <MetricCard label="مباريات جاهزة" value={String(activeMatches.length)} icon={Clock} tone="amber" />
        <MetricCard label="نتائج معلقة" value={String(pendingResults.length)} icon={AlertCircle} tone="rose" />
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="mb-4 text-sm font-black text-white">تسجيل لاعب جديد</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold text-slate-400">اسم اللاعب</label>
            <input
              type="text"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              placeholder="ProGamer123"
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold text-slate-400">معرف اللاعب</label>
            <input
              type="text"
              value={regGamerId}
              onChange={(e) => setRegGamerId(e.target.value)}
              placeholder="GM-XXX00"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={registering} className="btn-primary whitespace-nowrap">
            <UserPlus className="h-4 w-4" />
            {registering ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </form>
        {regError && <p className="mt-3 text-xs text-rose-400">{regError}</p>}
        {regSuccess && <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 className="h-4 w-4" />تم تسجيل اللاعب بنجاح</p>}
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-sm font-black text-white">المباريات الجاهزة — إرسال النتائج</h2>
        {activeMatches.length === 0 ? (
          <div className="glass-panel px-5 py-12 text-center text-sm text-slate-500">لا توجد مباريات جاهزة حالياً</div>
        ) : (
          <div className="space-y-3">
            {activeMatches.map((match) => (
              <div key={match.id} className="glass-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-200">{match.home_player?.username ?? 'TBD'}</span>
                    <span className="text-xs text-slate-600">VS</span>
                    <span className="text-sm font-bold text-slate-200">{match.away_player?.username ?? 'TBD'}</span>
                  </div>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    {STATUS_LABELS_AR[match.status] ?? match.status}
                  </span>
                </div>
                <SubmitResultForm match={match} onSubmitted={refresh} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-black text-white">النتائج المعلقة</h2>
        {pendingResults.length === 0 ? (
          <div className="glass-panel px-5 py-12 text-center text-sm text-slate-500">لا توجد نتائج معلقة</div>
        ) : (
          <div className="glass-panel overflow-hidden">
            {pendingResults.map((match) => (
              <div key={match.id} className="flex items-center justify-between border-b border-slate-800 px-5 py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200">{match.home_player?.username}</span>
                  <span className="rounded-lg bg-white/[0.04] px-3 py-1 font-mono text-sm font-black text-white">{match.home_score} : {match.away_score}</span>
                  <span className="text-xs font-bold text-slate-200">{match.away_player?.username}</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400"><Clock className="h-3 w-3" />بانتظار المراجعة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
