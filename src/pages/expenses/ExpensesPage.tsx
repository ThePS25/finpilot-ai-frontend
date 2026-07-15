import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, tableStyles } from '@/components/ui';
import { PieChartWidget, BarChartWidget } from '@/components/charts/ChartWidgets';
import { EXPENSE_CATEGORIES } from '@/types';
import type { Expense, Pagination } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => (await financialApi.getExpenseCategories()).data.data.categories,
  });

  const allCategories = [
    ...(categories?.default || EXPENSE_CATEGORIES),
    ...(categories?.custom || []),
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', activeProfileId, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeProfileId) params.profileId = activeProfileId;
      const res = await financialApi.getExpenses(params);
      return { expenses: res.data.data.expenses, pagination: res.data.pagination };
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['expense-analytics', activeProfileId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeProfileId) params.profileId = activeProfileId;
      return (await financialApi.getExpenseAnalytics(params)).data.data.analytics;
    },
  });

  const { register, handleSubmit, reset, watch } = useForm();
  const categoryValue = watch('category');

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Expense>) =>
      editing ? financialApi.updateExpense(editing._id, d) : financialApi.createExpense(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-analytics'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-analytics'] });
    },
  });

  const pagination = data?.pagination as Pagination | undefined;
  const expenses = data?.expenses || [];

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      {(analytics?.byCategory?.length || analytics?.byMonth?.length) ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {analytics?.byCategory?.length ? (
            <Card title="Expenses by Category"><PieChartWidget data={analytics.byCategory} /></Card>
          ) : null}
          {analytics?.byMonth?.length ? (
            <Card title="Expenses by Month"><BarChartWidget data={analytics.byMonth} /></Card>
          ) : null}
        </div>
      ) : null}

      <Card title="Expenses" action={<Button onClick={() => { setEditing(null); reset({ profileId: activeProfileId || profiles[0]?._id, date: new Date().toISOString().split('T')[0], category: 'Food' }); setModalOpen(true); }}>+ Add Expense</Button>}>
        <DataTable data={expenses} columns={[
          { key: 'category', header: 'Category', render: (e) => <span className={tableStyles.badge}>{e.category}</span> },
          { key: 'amount', header: 'Amount', render: (e) => formatCurrency(e.amount) },
          { key: 'description', header: 'Description', render: (e) => e.description || '—' },
          { key: 'date', header: 'Date', render: (e) => formatDate(e.date) },
          { key: 'actions', header: '', render: (e) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(e); reset({ ...e, date: e.date.split('T')[0] }); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(e._id)}>Delete</Button>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({ ...d, amount: Number(d.amount), category: d.category === '__custom' ? customCategory : d.category }))}>Save</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Select label="Category" options={[...allCategories.map((c) => ({ value: c, label: c })), { value: '__custom', label: '+ Custom Category' }]} {...register('category')} />
          {categoryValue === '__custom' && <Input label="Custom Category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />}
          <Input label="Amount" type="number" {...register('amount')} />
          <Input label="Description" {...register('description')} />
          <Input label="Date" type="date" {...register('date')} />
        </div>
      </Modal>
    </>
  );
}
