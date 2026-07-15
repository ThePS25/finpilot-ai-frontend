import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, DataTable, Modal, Input, Select, Loader, StatCard, tableStyles } from '@/components/ui';
import { INVESTMENT_TYPES } from '@/types';
import type { Investment } from '@/types';
import { formatCurrency } from '@/utils/format';

export function InvestmentsPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const profiles = useProfileStore((s) => s.profiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['investment-summary', activeProfileId],
    queryFn: async () => {
      const params = activeProfileId ? { profileIds: activeProfileId } : {};
      return (await financialApi.getInvestmentSummary(params)).data.data.summary as {
        totalInvested: number; totalCurrent: number; profitLoss: number; roiPercentage: number;
      };
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['investments', activeProfileId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeProfileId) params.profileId = activeProfileId;
      return (await financialApi.getInvestments(params)).data.data.investments;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Investment>) =>
      editing ? financialApi.updateInvestment(editing._id, d) : financialApi.createInvestment(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
    },
  });

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Invested" value={formatCurrency(summary.totalInvested)} icon="📊" />
          <StatCard label="Current Value" value={formatCurrency(summary.totalCurrent)} icon="💹" iconColor="green" />
          <StatCard label="Profit/Loss" value={formatCurrency(summary.profitLoss)} icon="📈" iconColor={summary.profitLoss >= 0 ? 'green' : 'red'} />
          <StatCard label="ROI" value={`${summary.roiPercentage}%`} icon="🎯" />
        </div>
      )}
      <Card title="Investments" action={<Button onClick={() => { setEditing(null); reset({ profileId: activeProfileId || profiles[0]?._id }); setModalOpen(true); }}>+ Add Investment</Button>}>
        <DataTable data={data || []} columns={[
          { key: 'type', header: 'Type', render: (i) => <span className={tableStyles.badge}>{i.investmentType}</span> },
          { key: 'invested', header: 'Invested', render: (i) => formatCurrency(i.amountInvested) },
          { key: 'current', header: 'Current', render: (i) => formatCurrency(i.currentValue) },
          { key: 'returns', header: 'Returns', render: (i) => {
            const ret = i.currentValue - i.amountInvested;
            return <span style={{ color: ret >= 0 ? '#10B981' : '#EF4444' }}>{formatCurrency(ret)}</span>;
          }},
          { key: 'actions', header: '', render: (i) => (
            <div className={tableStyles.actions}>
              <Button size="sm" variant="outline" onClick={() => { setEditing(i); reset(i); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(i._id)}>Delete</Button>
            </div>
          )},
        ]} />
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Investment' : 'Add Investment'}
        footer={<Button onClick={handleSubmit((d) => saveMutation.mutate({ ...d, amountInvested: Number(d.amountInvested), currentValue: Number(d.currentValue) }))}>Save</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Profile" options={profiles.map((p) => ({ value: p._id, label: p.name }))} {...register('profileId')} />
          <Select label="Type" options={INVESTMENT_TYPES.map((t) => ({ value: t, label: t }))} {...register('investmentType')} />
          <Input label="Name" {...register('name')} />
          <Input label="Amount Invested" type="number" {...register('amountInvested')} />
          <Input label="Current Value" type="number" {...register('currentValue')} />
        </div>
      </Modal>
    </>
  );
}
