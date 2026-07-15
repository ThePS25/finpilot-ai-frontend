import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [credentials, setCredentials] = useState<FormData | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const res = await authApi.login(data);
      const payload = res.data.data;

      if (payload.requiresTwoFactor) {
        setRequires2FA(true);
        setCredentials(data);
        return;
      }

      if (payload.user) {
        setUser(payload.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const onSubmit2FA = async () => {
    if (!credentials || !totpCode) return;
    try {
      setError('');
      const res = await authApi.login({ ...credentials, totpCode });
      const payload = res.data.data;
      if (payload.user) {
        setUser(payload.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (requires2FA) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Two-Factor Authentication</h2>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 8 }}>Enter the 6-digit code from your authenticator app</p>
        {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
        <Input label="TOTP Code" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} maxLength={6} />
        <Button fullWidth onClick={onSubmit2FA} disabled={totpCode.length < 6}>Verify</Button>
        <Button variant="ghost" fullWidth onClick={() => { setRequires2FA(false); setTotpCode(''); setCredentials(null); }}>Back</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 8 }}>Sign in to your FinPilot account</p>
      {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
      <div style={{ textAlign: 'right' }}>
        <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
      </div>
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748B' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
