import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, Modal, Input, Select, Loader } from '@/components/ui';
import { GOAL_TYPES } from '@/types';
import type { Goal } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import styles from './GoalsPage.module.scss';

export function GoalsPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['goals', activeProfileId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeProfileId) params.profileId = activeProfileId;
      return (await financialApi.getGoals(params)).data.data.goals;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Goal>) =>
      editing ? financialApi.updateGoal(editing._id, d) : financialApi.createGoal(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); setModalOpen(false); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button onClick={() => { setEditing(null); reset({ profileId: activeProfileId || profiles[0]?._id, currentSavings: 0, goalType: 'Other' }); setModalOpen(true); }}>+ Add Goal</Button>
      </div>
      <div className={styles.grid}>
        {(data || []).map((goal) => (
          <Card key={goal._id} title={goal.goalName} action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(goal); reset({ ...goal, targetDate: goal.targetDate.split('T')[0] }); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(goal._id)}>Delete</Button>
            </div>
          }>
            <div className={styles.goalCard}>
              <div className={styles.progressRing}>
                <svg viewBox="0 0 36 36">
                  <path className={styles.bg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={styles.fill} strokeDasharray={`${goal.completionPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span>{Math.round(goal.completionPercentage || 0)}%</span>
              </div>
              <div className={styles.details}>
                <div><label>Target</label><strong>{formatCurrency(goal.targetAmount)}</strong></div>
                <div><label>Saved</label><strong>{formatCurrency(goal.currentSavings)}</strong></div>
                <div><label>Remaining</label><strong>{formatCurrency(goal.remainingAmount || 0)}</strong></div>
                <div><label>Monthly Required</label><strong>{formatCurrency(goal.monthlyRequiredInvestment || 0)}</strong></div>
                <div><label>Target Date</label><strong>{formatDate(goal.targetDate)}</strong></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {(data || []).length === 0 && <Card><p style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No goals yet. Start planning!</p></Card>}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Goal' : 'Add Goal'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({ ...d, targetAmount: Number(d.targetAmount), currentSavings: Number(d.currentSavings || 0) }))}>Save</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Input label="Goal Name" {...register('goalName')} />
          <Select label="Goal Type" options={GOAL_TYPES.map((t) => ({ value: t, label: t }))} {...register('goalType')} />
          <Input label="Target Amount" type="number" {...register('targetAmount')} />
          <Input label="Current Savings" type="number" {...register('currentSavings')} />
          <Input label="Target Date" type="date" {...register('targetDate')} />
        </div>
      </Modal>
    </>
  );
}
