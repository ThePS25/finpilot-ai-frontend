import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { Button, Card, Loader } from '@/components/ui';
import { MONTHS } from '@/utils/format';
import styles from './InsightsPage.module.scss';

export function InsightsPage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: insightList } = useQuery({
    queryKey: ['insights-list'],
    queryFn: async () => (await financialApi.getInsights()).data.data.insights,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['insights', month, year],
    queryFn: async () =>
      (await financialApi.getMonthlyInsight({ month, year })).data.data.insight,
  });

  const generateMutation = useMutation({
    mutationFn: () => financialApi.generateInsight({ month, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['insights-list'] });
    },
  });

  if (isLoading) return <Loader fullPage />;

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0' }}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0' }}>
          {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <Card title={`${MONTHS[month - 1]} ${year} Insights`}
        action={<Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? 'Generating...' : 'Regenerate'}
        </Button>}>
        {data?.summary && <p className={styles.summary}>{data.summary}</p>}
        <div className={styles.insights}>
          {(data?.insights || []).map((insight, i) => (
            <div key={i} className={`${styles.insight} ${styles[insight.trend]}`}>
              <div className={styles.insightHeader}>
                <span className={styles.category}>{insight.category}</span>
                {insight.percentageChange !== undefined && (
                  <span className={styles.change}>
                    {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'} {Math.abs(insight.percentageChange)}%
                  </span>
                )}
              </div>
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {(insightList || []).length > 0 && (
        <div style={{ marginTop: 24 }}>
        <Card title="Past Insights">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insightList!.map((item) => (
              <button
                key={item._id}
                onClick={() => { setMonth(item.month); setYear(item.year); }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  background: month === item.month && year === item.year ? 'rgba(37, 99, 235, 0.06)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                }}
              >
                <span>{MONTHS[item.month - 1]} {item.year}</span>
                <span style={{ color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                  {item.summary?.slice(0, 60)}...
                </span>
              </button>
            ))}
          </div>
        </Card>
        </div>
      )}
    </div>
  );
}
