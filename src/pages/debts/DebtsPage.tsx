import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, StatCard, tableStyles } from '@/components/ui';
import { DEBT_TYPES } from '@/types';
import type { Debt } from '@/types';
import { formatCurrency } from '@/utils/format';

export function DebtsPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);

  const params: Record<string, string> = {};
  if (activeProfileId) params.profileId = activeProfileId;

  const { data: summary } = useQuery({
    queryKey: ['debt-summary', activeProfileId],
    queryFn: async () => (await financialApi.getDebtSummary(params)).data.data.summary,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['debts', activeProfileId],
    queryFn: async () => (await financialApi.getDebts(params)).data.data.debts,
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Debt>) =>
      editing ? financialApi.updateDebt(editing._id, d) : financialApi.createDebt(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-summary'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteDebt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-summary'] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      profileId: activeProfileId || profiles[0]?._id,
      debtType: 'Personal Loan',
      interestRate: 0,
      monthlyEmi: 0,
    });
    setModalOpen(true);
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Outstanding" value={formatCurrency(summary.totalOutstanding)} icon="💸" iconColor="red" />
          <StatCard label="Total EMI / Month" value={formatCurrency(summary.totalEmi)} icon="📅" />
          <StatCard label="Active Debts" value={String(summary.debtCount)} icon="📋" />
        </div>
      )}
      <Card title="Debts & Loans" action={<Button onClick={openCreate}>+ Add Debt</Button>}>
        <DataTable data={data || []} columns={[
          { key: 'name', header: 'Name', render: (d) => d.name },
          { key: 'debtType', header: 'Type', render: (d) => <span className={tableStyles.badge}>{d.debtType}</span> },
          { key: 'outstanding', header: 'Outstanding', render: (d) => formatCurrency(d.outstandingAmount) },
          { key: 'emi', header: 'EMI', render: (d) => formatCurrency(d.monthlyEmi) },
          { key: 'rate', header: 'Rate', render: (d) => `${d.interestRate}%` },
          { key: 'actions', header: '', render: (d) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(d); reset(d); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(d._id)}>Delete</Button>
            </div>
          )},
        ]} />
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Debt' : 'Add Debt'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({
          ...d,
          principalAmount: Number(d.principalAmount),
          outstandingAmount: Number(d.outstandingAmount),
          interestRate: Number(d.interestRate),
          monthlyEmi: Number(d.monthlyEmi),
        }))}>{editing ? 'Update' : 'Create'}</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Input label="Name" {...register('name')} />
          <Select label="Debt Type" options={DEBT_TYPES.map((t) => ({ value: t, label: t }))} {...register('debtType')} />
          <Input label="Principal Amount" type="number" {...register('principalAmount')} />
          <Input label="Outstanding Amount" type="number" {...register('outstandingAmount')} />
          <Input label="Interest Rate (%)" type="number" step="0.01" {...register('interestRate')} />
          <Input label="Monthly EMI" type="number" {...register('monthlyEmi')} />
        </div>
      </Modal>
    </>
  );
}
