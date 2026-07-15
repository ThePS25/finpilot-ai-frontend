import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, Loader } from '@/components/ui';
import { LineChartWidget } from '@/components/charts/ChartWidgets';
import { formatDate } from '@/utils/format';
import styles from './FinancialHealthPage.module.scss';

export function FinancialHealthPage() {
  const queryClient = useQueryClient();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);

  const params = activeProfileId ? { profileId: activeProfileId } : {};

  const { data, isLoading } = useQuery({
    queryKey: ['financial-health', activeProfileId],
    queryFn: async () => (await financialApi.getFinancialHealth(params)).data.data.health,
  });

  const { data: history } = useQuery({
    queryKey: ['financial-health-history', activeProfileId],
    queryFn: async () => (await financialApi.getFinancialHealthHistory(params)).data.data.history,
  });

  const calcMutation = useMutation({
    mutationFn: () => financialApi.calculateFinancialHealth(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-health'] });
      queryClient.invalidateQueries({ queryKey: ['financial-health-history'] });
    },
  });

  if (isLoading) return <Loader fullPage />;

  const historyChart = (history || []).map((h) => ({
    name: formatDate(h.calculatedAt).slice(0, 6),
    score: h.score,
  }));

  return (
    <div className={styles.page}>
      <Card title="Financial Health Score" action={
        <Button onClick={() => calcMutation.mutate()} disabled={calcMutation.isPending}>
          {calcMutation.isPending ? 'Calculating...' : 'Recalculate'}
        </Button>
      }>
        <div className={styles.scoreSection}>
          <div className={styles.scoreCircle}>
            <span>{data?.score ?? 0}</span>
            <small>/ 100</small>
          </div>
          <div className={styles.reasons}>
            <h4>Analysis</h4>
            <ul>
              {(data?.reasons || []).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      </Card>

      {historyChart.length > 0 && (
        <Card title="Score History">
          <LineChartWidget
            data={historyChart}
            title=""
            lines={[{ key: 'score', color: '#2563EB', name: 'Health Score' }]}
          />
        </Card>
      )}

      {data?.components && (
        <div className={styles.components}>
          {Object.entries(data.components).map(([key, comp]) => (
            <Card key={key} title={key.replace(/([A-Z])/g, ' $1')}>
              <div className={styles.compScore}>{comp.score}/100</div>
              <div className={styles.compBar}>
                <div style={{ width: `${comp.score}%` }} />
              </div>
              <div className={styles.compValue}>Value: {comp.value}{key.includes('Rate') || key.includes('Ratio') ? '%' : key.includes('Fund') ? ' months' : ''}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
