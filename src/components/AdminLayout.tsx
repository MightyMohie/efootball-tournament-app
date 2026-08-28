import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  ChevronDown,
  Gamepad2,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trophy,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export type AdminView = 'overview' | 'matches' | 'standings' | 'clubs' | 'player' | 'moderator';

interface AdminLayoutProps {
  children: ReactNode;
}

const commandCenterNav: Array<{ id: AdminView; label: string; icon: typeof LayoutDashboard; badge?: number }> = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'matches', label: 'مركز المباريات', icon: Swords, badge: 1 },
  { id: 'standings', label: 'الترتيب', icon: ListOrdered },
  { id: 'clubs', label: 'حجوزات الأندية', icon: ShieldCheck },
];

const operationsNav: Array<{ id: AdminView; label: string; icon: typeof Upload; dot?: boolean; badge?: number }> = [
  { id: 'player', label: 'بوابة اللاعبين', icon: Upload, dot: true },
  { id: 'moderator', label: 'قائمة المشرفين', icon: ShieldAlert, badge: 1 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathSegment = location.pathname.split('/').pop() ?? 'dashboard';
  const currentView: AdminView = pathSegment === 'dashboard' ? 'overview' : (([...commandCenterNav, ...operationsNav].find((n) => n.id === pathSegment)?.id) ?? 'overview') as AdminView;

  const handleNav = (view: AdminView) => {
    setMobileOpen(false);
    navigate(view === 'overview' ? '/admin/dashboard' : `/admin/${view}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavButton = ({ item, section }: { item: { id: AdminView; label: string; icon: typeof LayoutDashboard; badge?: number; dot?: boolean }; section: 'command' | 'ops' }) => {
    const Icon = item.icon;
    const active = currentView === item.id;
    const activeClass = section === 'ops' && active
      ? 'bg-emerald-500/10 text-emerald-300 shadow-[inset_-3px_0_0_#34d399]'
      : active
        ? 'nav-item nav-item-active'
        : 'nav-item nav-item-idle';
    return (
      <button key={item.id} onClick={() => handleNav(item.id)} className={activeClass}>
        <Icon className={`h-[18px] w-[18px] ${active ? (section === 'ops' ? 'text-emerald-400' : 'text-sky-400') : 'text-slate-500'}`} />
        <span className="font-medium">{item.label}</span>
        {item.badge !== undefined && (
          <span className={`mr-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? (section === 'ops' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-sky-400/10 text-sky-300') : 'bg-slate-800 text-slate-400'}`}>
            {item.badge}
          </span>
        )}
        {item.dot && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      </button>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 shadow-lg shadow-sky-500/20">
          <Trophy className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>
        <div>
          <div className="text-sm font-black tracking-wide text-white">PLAYMAKER</div>
          <div className="mt-0.5 text-[9px] font-semibold text-slate-500">نظام إدارة البطولات</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-3 px-3 text-[10px] font-bold text-slate-600">مركز القيادة</div>
        <div className="space-y-1">{commandCenterNav.map((item) => <NavButton key={item.id} item={item} section="command" />)}</div>

        <div className="my-7 h-px bg-slate-800" />

        <div className="mb-3 px-3 text-[10px] font-bold text-slate-600">العمليات</div>
        <div className="space-y-1">{operationsNav.map((item) => <NavButton key={item.id} item={item} section="ops" />)}</div>

        <div className="my-7 h-px bg-slate-800" />
        <div className="rounded-2xl border border-sky-500/10 bg-gradient-to-br from-sky-500/10 to-transparent p-4">
          <div className="mb-2 flex items-center gap-2 text-sky-300">
            <Activity className="h-4 w-4" />
            <span className="text-[10px] font-bold">مزامنة حية للبيانات</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">جميع الأنظمة تعمل</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            الأنظمة تعمل
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 p-3">
        <div className="flex w-full items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-2 ring-slate-700">
            <UserRound className="h-4 w-4 text-slate-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-200">{user?.gamerTag ?? 'لاعب'}</div>
            <div className="truncate text-[10px] text-slate-500">{user?.email ?? ''}</div>
          </div>
          <button onClick={handleSignOut} className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400" title="تسجيل الخروج">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const bottomNavItems = [...commandCenterNav.slice(0, 4), operationsNav[1]];
  const bottomNav = (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl lg:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = currentView === item.id;
        return (
          <button key={item.id} onClick={() => handleNav(item.id)} className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${active ? 'text-sky-400' : 'text-slate-500'}`}>
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.badge !== undefined && <span className="absolute right-1/2 top-1.5 translate-x-4 rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">{item.badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 border-l border-slate-800 bg-slate-900/90 lg:block">{sidebar}</aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-slate-800 bg-slate-900 transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute left-4 top-6">
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebar}
      </aside>

      <div className="lg:pr-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Gamepad2 className="h-4 w-4" />
              <span>منصة ملوك اللعبة</span>
              <span className="text-slate-700">/</span>
              <span className="text-slate-300">الموسم 7</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 sm:hidden">
              <Trophy className="h-4 w-4 text-sky-400" />
              الموسم 7
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold text-emerald-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              موسم نشط
            </div>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-white/5 hover:text-slate-200">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-slate-950" />
            </button>
            <button className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white md:flex">
              <ChevronDown className="h-4 w-4" />
              المساعدة
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-8 lg:pb-8">{children}</main>
      </div>

      {bottomNav}
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-sky-400">
          <span className="h-px w-6 bg-sky-400/60" />
          {eyebrow}
        </div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, detail, icon: Icon, tone = 'sky' }: { label: string; value: string; detail?: string; icon: typeof Trophy; tone?: 'sky' | 'emerald' | 'amber' | 'rose' }) {
  const tones = {
    sky: 'text-sky-400 bg-sky-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    rose: 'text-rose-400 bg-rose-400/10',
  };
  return (
    <div className="stat-card glass-panel-hover group">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-sky-400/5 blur-2xl transition-all group-hover:bg-sky-400/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="section-heading">{title}</h2>
      {action}
    </div>
  );
}

export function ViewMoreButton({ to }: { to: string }) {
  return (
    <Link to={to} className="group flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300">
      عرض الكل
      <ChevronDown className="h-3.5 w-3.5 rotate-90 transition-transform group-hover:-translate-x-1" />
    </Link>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Activity className="h-6 w-6 animate-spin text-sky-400" />
    </div>
  );
}

export { Zap };
