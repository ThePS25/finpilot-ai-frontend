import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Email Verification</h2>
      {status === 'loading' && <p style={{ color: '#64748B' }}>Verifying your email...</p>}
      {status === 'success' && (
        <>
          <div style={{ background: '#ECFDF5', color: '#10B981', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {message}
          </div>
          <Link to="/login"><Button>Go to Login</Button></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {message}
          </div>
          <Link to="/login"><Button variant="outline">Back to Login</Button></Link>
        </>
      )}
    </div>
  );
}
