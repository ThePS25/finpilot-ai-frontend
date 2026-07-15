import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await authApi.forgotPassword(data.email);
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Reset password</h2>
      <p style={{ color: '#64748B', fontSize: 14 }}>Enter your email to receive a reset link</p>
      {message && <div style={{ background: '#ECFDF5', color: '#10B981', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{message}</div>}
      {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
      <Input label="Email" type="email" {...register('email')} />
      <Button type="submit" fullWidth disabled={isSubmitting}>Send Reset Link</Button>
      <Link to="/login" style={{ textAlign: 'center', fontSize: 14 }}>Back to login</Link>
    </form>
  );
}
