import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, tableStyles } from '@/components/ui';
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES } from '@/types';
import type { RecurringExpense } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export function RecurringPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);

  const params: Record<string, string> = {};
  if (activeProfileId) params.profileId = activeProfileId;

  const { data, isLoading } = useQuery({
    queryKey: ['recurring-expenses', activeProfileId],
    queryFn: async () => (await financialApi.getRecurringExpenses(params)).data.data.recurringExpenses,
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<RecurringExpense>) =>
      editing ? financialApi.updateRecurringExpense(editing._id, d) : financialApi.createRecurringExpense(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteRecurringExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] }),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      profileId: activeProfileId || profiles[0]?._id,
      category: 'Utilities',
      frequency: 'Monthly',
      nextDueDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      <Card title="Recurring Expenses" action={<Button onClick={openCreate}>+ Add Recurring</Button>}>
        <DataTable data={data || []} columns={[
          { key: 'title', header: 'Title', render: (r) => r.title },
          { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
          { key: 'category', header: 'Category', render: (r) => <span className={tableStyles.badge}>{r.category}</span> },
          { key: 'frequency', header: 'Frequency', render: (r) => r.frequency },
          { key: 'nextDue', header: 'Next Due', render: (r) => formatDate(r.nextDueDate) },
          { key: 'actions', header: '', render: (r) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => {
                setEditing(r);
                reset({ ...r, nextDueDate: r.nextDueDate.split('T')[0] });
                setModalOpen(true);
              }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r._id)}>Delete</Button>
            </div>
          )},
        ]} />
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({ ...d, amount: Number(d.amount) }))}>Save</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Input label="Title" {...register('title')} />
          <Input label="Amount" type="number" {...register('amount')} />
          <Select label="Category" options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} />
          <Select label="Frequency" options={RECURRING_FREQUENCIES.map((f) => ({ value: f, label: f }))} {...register('frequency')} />
          <Input label="Next Due Date" type="date" {...register('nextDueDate')} />
        </div>
      </Modal>
    </>
  );
}
