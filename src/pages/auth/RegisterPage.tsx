import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and number'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await authApi.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (success) {
    return <div style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h3>Account created!</h3>
      <p style={{ color: '#64748B', marginTop: 8 }}>Redirecting to login...</p>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Create account</h2>
      {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
      <Input label="Full Name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </Button>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748B' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
