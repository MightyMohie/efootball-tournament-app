import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AuthCard, EmailField, PasswordField, FormError, SubmitButton } from '@/components/AuthCard';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate('/admin/dashboard');
  };

  return (
    <AuthCard
      title="تسجيل الدخول"
      subtitle="مرحباً بعودتك إلى منصة ملوك اللعبة"
      footer={
        <>
          ليس لديك حساب؟{' '}
          <Link to="/register" className="font-bold text-sky-400 hover:text-sky-300">
            إنشاء حساب جديد
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />
        <EmailField value={email} onChange={setEmail} />
        <PasswordField value={password} onChange={setPassword} />
        <SubmitButton label="دخول" loading={loading} />
      </form>
    </AuthCard>
  );
}
