import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/api/auth.api';
import { financialApi } from '@/api/financial.api';
import { useAuthStore, useProfileStore } from '@/store';
import { Button, Card, Input, Loader } from '@/components/ui';
import { getErrorMessage } from '@/utils/format';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const importRef = useRef<HTMLInputElement>(null);

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');

  const { register: regName, handleSubmit: submitName } = useForm({ defaultValues: { name: user?.name || '' } });
  const { register: regPass, handleSubmit: submitPass } = useForm<{ currentPassword: string; newPassword: string }>();

  const updateNameMutation = useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: (res) => { setUser(res.data.data.user); setMsg('Profile updated'); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const changePassMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => authApi.changePassword(data),
    onSuccess: () => { setMsg('Password changed successfully'); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const verifyMutation = useMutation({
    mutationFn: () => authApi.sendVerification(),
    onSuccess: () => { setMsg('Verification email sent'); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const setup2FAMutation = useMutation({
    mutationFn: () => authApi.setup2FA(),
    onSuccess: (res) => { setQrCode(res.data.data.setup.qrCodeUrl); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const enable2FAMutation = useMutation({
    mutationFn: (code: string) => authApi.enable2FA(code),
    onSuccess: (res) => { setUser(res.data.data.user); setQrCode(null); setTotpCode(''); setMsg('2FA enabled'); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const disable2FAMutation = useMutation({
    mutationFn: (code: string) => authApi.disable2FA(code),
    onSuccess: (res) => { setUser(res.data.data.user); setTotpCode(''); setMsg('2FA disabled'); setErr(''); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => financialApi.importExpenses(activeProfileId || profiles[0]?._id || '', file),
    onSuccess: (res) => {
      setMsg(`Imported ${res.data.data.imported} expenses`);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const handleExportIncomes = async () => {
    try {
      const params = activeProfileId ? { profileId: activeProfileId } : {};
      const res = await financialApi.exportIncomes(params);
      downloadBlob(res.data as Blob, 'incomes.csv');
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const handleExportExpenses = async () => {
    try {
      const params = activeProfileId ? { profileId: activeProfileId } : {};
      const res = await financialApi.exportExpenses(params);
      downloadBlob(res.data as Blob, 'expenses.csv');
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  if (!user) return <Loader fullPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      {msg && <div style={{ background: '#ECFDF5', color: '#10B981', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{msg}</div>}
      {err && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{err}</div>}

      <Card title="Profile">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submitName((d) => updateNameMutation.mutate(d))}>
          <Input label="Name" {...regName('name')} />
          <Input label="Email" value={user.email} disabled />
          <Button type="submit" disabled={updateNameMutation.isPending}>Save Name</Button>
        </form>
      </Card>

      <Card title="Email Verification">
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 12 }}>
          Status: {user.isEmailVerified ? '✓ Verified' : 'Not verified'}
        </p>
        {!user.isEmailVerified && (
          <Button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending}>
            Send Verification Email
          </Button>
        )}
      </Card>

      <Card title="Change Password">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submitPass((d) => changePassMutation.mutate(d))}>
          <Input label="Current Password" type="password" {...regPass('currentPassword', { required: true })} />
          <Input label="New Password" type="password" {...regPass('newPassword', { required: true, minLength: 8 })} />
          <Button type="submit" disabled={changePassMutation.isPending}>Change Password</Button>
        </form>
      </Card>

      <Card title="Two-Factor Authentication">
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 12 }}>
          Status: {user.isTwoFactorEnabled ? '✓ Enabled' : 'Disabled'}
        </p>
        {!user.isTwoFactorEnabled ? (
          <>
            {!qrCode ? (
              <Button onClick={() => setup2FAMutation.mutate()} disabled={setup2FAMutation.isPending}>
                Setup 2FA
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                <img src={qrCode} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
                <Input label="Enter TOTP Code" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                <Button onClick={() => enable2FAMutation.mutate(totpCode)} disabled={enable2FAMutation.isPending || !totpCode}>
                  Enable 2FA
                </Button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Enter TOTP Code to Disable" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
            <Button variant="outline" onClick={() => disable2FAMutation.mutate(totpCode)} disabled={disable2FAMutation.isPending || !totpCode}>
              Disable 2FA
            </Button>
          </div>
        )}
      </Card>

      <Card title="Data Export / Import">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Button variant="outline" onClick={handleExportIncomes}>Export Incomes (CSV)</Button>
          <Button variant="outline" onClick={handleExportExpenses}>Export Expenses (CSV)</Button>
          <Button variant="outline" onClick={() => importRef.current?.click()} disabled={importMutation.isPending}>
            {importMutation.isPending ? 'Importing...' : 'Import Expenses (CSV)'}
          </Button>
          <input ref={importRef} type="file" accept=".csv" hidden onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importMutation.mutate(file);
            e.target.value = '';
          }} />
        </div>
      </Card>
    </div>
  );
}
