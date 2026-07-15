import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, tableStyles } from '@/components/ui';
import { PieChartWidget, BarChartWidget } from '@/components/charts/ChartWidgets';
import { INCOME_TYPES, INCOME_FREQUENCIES } from '@/types';
import type { Income, Pagination } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export function IncomePage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['incomes', activeProfileId, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeProfileId) params.profileId = activeProfileId;
      const res = await financialApi.getIncomes(params);
      return { incomes: res.data.data.incomes, pagination: res.data.pagination };
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['income-analytics', activeProfileId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeProfileId) params.profileId = activeProfileId;
      return (await financialApi.getIncomeAnalytics(params)).data.data.analytics;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Income>) =>
      editing ? financialApi.updateIncome(editing._id, d) : financialApi.createIncome(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incomes'] }); queryClient.invalidateQueries({ queryKey: ['income-analytics'] }); setModalOpen(false); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteIncome(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incomes'] }); queryClient.invalidateQueries({ queryKey: ['income-analytics'] }); },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ profileId: activeProfileId || profiles[0]?._id, date: new Date().toISOString().split('T')[0], frequency: 'Monthly' });
    setModalOpen(true);
  };

  const pagination = data?.pagination as Pagination | undefined;
  const incomes = data?.incomes || [];

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      {(analytics?.byType?.length || analytics?.byMonth?.length) ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {analytics?.byType?.length ? (
            <Card title="Income by Type"><PieChartWidget data={analytics.byType} /></Card>
          ) : null}
          {analytics?.byMonth?.length ? (
            <Card title="Income by Month"><BarChartWidget data={analytics.byMonth} /></Card>
          ) : null}
        </div>
      ) : null}

      <Card title="Income" action={<Button onClick={openCreate}>+ Add Income</Button>}>
        <DataTable data={incomes} columns={[
          { key: 'title', header: 'Title', render: (i) => i.title },
          { key: 'amount', header: 'Amount', render: (i) => formatCurrency(i.amount) },
          { key: 'type', header: 'Type', render: (i) => <span className={tableStyles.badge}>{i.type}</span> },
          { key: 'frequency', header: 'Frequency', render: (i) => i.frequency },
          { key: 'date', header: 'Date', render: (i) => formatDate(i.date) },
          { key: 'actions', header: '', render: (i) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(i); reset({ ...i, date: i.date.split('T')[0] }); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(i._id)}>Delete</Button>
            </div>
          )},
        ]} />
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <Button size="sm" variant="outline" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span style={{ fontSize: 13, alignSelf: 'center' }}>Page {pagination.page} of {pagination.totalPages}</span>
            <Button size="sm" variant="outline" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({ ...d, amount: Number(d.amount) }))}>{editing ? 'Update' : 'Create'}</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Input label="Title" {...register('title')} />
          <Input label="Amount" type="number" {...register('amount')} />
          <Select label="Type" options={INCOME_TYPES.map((t) => ({ value: t, label: t }))} {...register('type')} />
          <Select label="Frequency" options={INCOME_FREQUENCIES.map((f) => ({ value: f, label: f }))} {...register('frequency')} />
          <Input label="Date" type="date" {...register('date')} />
        </div>
      </Modal>
    </>
  );
}
