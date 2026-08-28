import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  gamerTag: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, gamerTag: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, gamer_tag, role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    gamerTag: data.gamer_tag,
    role: data.role,
  };
}

function mapUser(user: User, gamerTag: string, role: string): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    gamerTag,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setUser(profile ?? mapUser(session.user, session.user.email ?? '', 'player'));
        }
      }
      if (mounted) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      (async () => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        const profile = await fetchProfile(session.user.id);
        setUser(profile ?? mapUser(session.user, session.user.email ?? '', 'player'));
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, gamerTag: string) => {
    if (!email.trim() || !password.trim() || !gamerTag.trim()) {
      return { error: 'يرجى ملء جميع الحقول' };
    }
    if (password.length < 6) {
      return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { gamer_tag: gamerTag.trim() } },
    });

    if (error) {
      if (error.message.includes('already') || error.message.includes('registered')) {
        return { error: 'هذا البريد مسجل بالفعل' };
      }
      return { error: error.message };
    }

    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile ?? mapUser(data.user, gamerTag, 'player'));
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { error: 'يرجى إدخال البريد وكلمة المرور' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('credentials')) {
        return { error: 'البريد أو كلمة المرور غير صحيحة' };
      }
      return { error: error.message };
    }

    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile ?? mapUser(data.user, data.user.email ?? '', 'player'));
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
