import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

const schema = z.object({
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and number'),
});

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ password: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { password: string }) => {
    try {
      await authApi.resetPassword(token, data.password);
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Set new password</h2>
      {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
      <Input label="New Password" type="password" {...register('password')} />
      <Button type="submit" fullWidth disabled={isSubmitting}>Reset Password</Button>
      <Link to="/login" style={{ textAlign: 'center', fontSize: 14 }}>Back to login</Link>
    </form>
  );
}
