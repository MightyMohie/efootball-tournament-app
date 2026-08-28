import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Loader2, Gamepad2 } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 shadow-lg shadow-sky-500/20">
            <Gamepad2 className="h-6 w-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-lg font-black tracking-wide text-white">PLAYMAKER</div>
            <div className="text-[10px] font-semibold text-slate-500">نظام إدارة البطولات</div>
          </div>
        </Link>

        <div className="glass-panel animate-slide-up p-7">
          <div className="mb-6 text-right">
            <h1 className="text-2xl font-black text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
          <div className="mt-6 border-t border-slate-800 pt-5 text-center text-sm text-slate-400">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: ReactNode;
  autoComplete?: string;
}

function Field({ label, type, value, onChange, placeholder, icon, autoComplete }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      <label className="mb-2 block text-right text-xs font-bold text-slate-400">{label}</label>
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">{icon}</span>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input-field pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export { Field };

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-right text-xs text-rose-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full py-3">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}



export function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="البريد الإلكتروني" type="email" value={value} onChange={onChange} placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} autoComplete="email" />
  );
}

export function PasswordField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="كلمة المرور" type="password" value={value} onChange={onChange} placeholder="••••••••" icon={<Lock className="h-4 w-4" />} autoComplete="current-password" />
  );
}

export function GamerTagField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="اسم اللاعب" type="text" value={value} onChange={onChange} placeholder="ProGamer123" icon={<User className="h-4 w-4" />} />
  );
}
