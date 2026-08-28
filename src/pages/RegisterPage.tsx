import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AuthCard, EmailField, PasswordField, GamerTagField, FormError, SubmitButton } from '@/components/AuthCard';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, gamerTag);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    navigate('/admin/dashboard');
  };

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      subtitle="انضم إلى منصة ملوك اللعبة"
      footer={
        <>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="font-bold text-sky-400 hover:text-sky-300">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />
        <EmailField value={email} onChange={setEmail} />
        <PasswordField value={password} onChange={setPassword} />
        <GamerTagField value={gamerTag} onChange={setGamerTag} />
        <SubmitButton label="تسجيل" loading={loading} />
      </form>
    </AuthCard>
  );
}
