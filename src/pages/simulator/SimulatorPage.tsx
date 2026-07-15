import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, Input, Select, Loader } from '@/components/ui';
import { SCENARIO_TYPES } from '@/types';
import { LineChartWidget } from '@/components/charts/ChartWidgets';
import styles from './SimulatorPage.module.scss';

export function SimulatorPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const [result, setResult] = useState<Awaited<ReturnType<typeof financialApi.simulateScenario>>['data']['data']['scenario'] | null>(null);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: 'My Scenario',
      scenarioType: 'Salary Increase',
      durationMonths: 24,
      amount: 10000,
      emi: 0,
      monthlyContribution: 0,
      expectedReturn: 0,
    },
  });
  const scenarioType = watch('scenarioType');

  const { data: history, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => (await financialApi.getScenarios()).data.data.scenarios,
  });

  const simulateMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => financialApi.simulateScenario({
      name: d.name as string,
      scenarioType: d.scenarioType as string,
      profileId: activeProfileId || undefined,
      parameters: {
        amount: Number(d.amount),
        durationMonths: Number(d.durationMonths),
        emi: Number(d.emi || 0),
        monthlyContribution: Number(d.monthlyContribution || 0),
        expectedReturn: Number(d.expectedReturn || 0),
      },
    }),
    onSuccess: (res) => {
      setResult(res.data.data.scenario);
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteScenario(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      if (result?._id === id) setResult(null);
    },
  });

  if (isLoading) return <Loader fullPage />;

  return (
    <div className={styles.page}>
      <Card title="Scenario Simulator">
        <form className={styles.form} onSubmit={handleSubmit((d) => simulateMutation.mutate(d))}>
          <Input label="Scenario Name" {...register('name')} />
          <Select label="Scenario Type" options={SCENARIO_TYPES.map((t) => ({ value: t, label: t }))} {...register('scenarioType')} />
          <Input label="Amount (₹)" type="number" {...register('amount')} />
          {scenarioType === 'New Loan' && <Input label="EMI (₹/month)" type="number" {...register('emi')} />}
          {scenarioType === 'New Investment' && (
            <>
              <Input label="Monthly Contribution (₹)" type="number" {...register('monthlyContribution')} />
              <Input label="Expected Return (% p.a.)" type="number" {...register('expectedReturn')} />
            </>
          )}
          <Input label="Duration (months)" type="number" {...register('durationMonths')} />
          <Button type="submit" disabled={simulateMutation.isPending}>
            {simulateMutation.isPending ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </form>
      </Card>

      {result && (
        <Card title="Projection Results" subtitle={result.summary}>
          <LineChartWidget
            data={result.projections.netWorthGrowth.map((p) => ({ name: `M${p.month}`, netWorth: p.netWorth }))}
            title="Net Worth Growth"
            lines={[{ key: 'netWorth', color: '#2563EB', name: 'Net Worth' }]}
          />
          {result.projections.goalTimelines.length > 0 && (
            <div className={styles.goals}>
              <h4>Goal Timelines</h4>
              {result.projections.goalTimelines.map((g) => (
                <div key={g.goalId} className={styles.goalRow}>
                  <span>{g.goalName}</span>
                  <span>{g.monthsToGoal ? `${g.monthsToGoal} months` : 'Not achievable'}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {(history || []).length > 0 && (
        <Card title="Past Simulations">
          <div className={styles.history}>
            {history!.map((s) => (
              <div key={s._id} className={styles.historyItem}>
                <div onClick={() => setResult(s)} style={{ flex: 1, cursor: 'pointer' }}>
                  <strong>{s.name}</strong>
                  <span>{s.scenarioType}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(s._id); }}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 18, padding: '0 8px' }}
                  title="Delete"
                >×</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
