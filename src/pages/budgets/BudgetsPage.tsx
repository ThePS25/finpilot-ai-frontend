import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, tableStyles } from '@/components/ui';
import { EXPENSE_CATEGORIES } from '@/types';
import type { Budget } from '@/types';
import { formatCurrency, MONTHS } from '@/utils/format';

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const now = new Date();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const params: Record<string, string | number> = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
  if (activeProfileId) params.profileId = activeProfileId;

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', activeProfileId, params.month, params.year],
    queryFn: async () => (await financialApi.getBudgets(params)).data.data.budgets,
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Budget>) =>
      editing ? financialApi.updateBudget(editing._id, d) : financialApi.createBudget(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      profileId: activeProfileId || profiles[0]?._id,
      category: 'Food',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertThreshold: 80,
    });
    setModalOpen(true);
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      <Card title={`Budgets — ${MONTHS[now.getMonth()]} ${now.getFullYear()}`} action={<Button onClick={openCreate}>+ Add Budget</Button>}>
        <DataTable data={data || []} columns={[
          { key: 'category', header: 'Category', render: (b) => <span className={tableStyles.badge}>{b.category}</span> },
          { key: 'limit', header: 'Limit', render: (b) => formatCurrency(b.limitAmount) },
          { key: 'spent', header: 'Spent', render: (b) => b.spent !== undefined ? formatCurrency(b.spent) : '—' },
          { key: 'used', header: 'Used', render: (b) => {
            if (b.percentUsed === undefined) return '—';
            const color = b.percentUsed >= 100 ? '#EF4444' : b.percentUsed >= (b.alertThreshold ?? 80) ? '#F59E0B' : '#10B981';
            return (
              <div style={{ minWidth: 120 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{b.percentUsed.toFixed(0)}%</div>
                <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, marginTop: 4 }}>
                  <div style={{ width: `${Math.min(b.percentUsed, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
                </div>
              </div>
            );
          }},
          { key: 'actions', header: '', render: (b) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(b); reset(b); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(b._id)}>Delete</Button>
            </div>
          )},
        ]} />
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Budget' : 'Add Budget'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({
          ...d,
          limitAmount: Number(d.limitAmount),
          month: Number(d.month),
          year: Number(d.year),
          alertThreshold: d.alertThreshold ? Number(d.alertThreshold) : undefined,
        }))}>Save</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Select label="Category" options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} />
          <Input label="Limit Amount" type="number" {...register('limitAmount')} />
          <Input label="Month (1-12)" type="number" min={1} max={12} {...register('month')} />
          <Input label="Year" type="number" {...register('year')} />
          <Input label="Alert Threshold (%)" type="number" {...register('alertThreshold')} />
        </div>
      </Modal>
    </>
  );
}
