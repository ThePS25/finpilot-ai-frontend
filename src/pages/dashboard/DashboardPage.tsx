import { useQuery } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { StatCard, Card, Loader } from '@/components/ui';
import { PieChartWidget } from '@/components/charts/ChartWidgets';
import { formatCurrency } from '@/utils/format';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const activeProfileId = useProfileStore((s) => s.activeProfileId);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', activeProfileId],
    queryFn: async () => {
      const params = activeProfileId ? { profileIds: activeProfileId } : {};
      const res = await financialApi.getDashboard(params);
      return res.data.data.dashboard;
    },
  });

  if (isLoading) return <Loader fullPage />;
  if (!data) return null;

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        <StatCard label="Net Worth" value={formatCurrency(data.netWorth)} icon="💎" iconColor="blue" />
        <StatCard label="Monthly Income" value={formatCurrency(data.monthlyIncome)} icon="💰" iconColor="green" />
        <StatCard label="Monthly Expenses" value={formatCurrency(data.monthlyExpenses)} icon="💳" iconColor="orange" />
        <StatCard label="Savings" value={formatCurrency(data.savings)} icon="🏦" iconColor="green"
          change={{ value: `${data.savingsRate}% rate`, trend: data.savingsRate >= 20 ? 'up' : 'down' }} />
      </div>

      <div className={styles.grid}>
        <Card title="Income by Type">
          <PieChartWidget data={data.charts.incomeByType} />
        </Card>
        <Card title="Expenses by Category">
          <PieChartWidget data={data.charts.expenseByCategory} />
        </Card>
      </div>

      <div className={styles.grid}>
        <Card title="Investments" subtitle={`Total: ${formatCurrency(data.investments.totalCurrent)}`}>
          <div className={styles.investmentStats}>
            <div><span>Invested</span><strong>{formatCurrency(data.investments.totalInvested)}</strong></div>
            <div><span>P/L</span><strong style={{ color: data.investments.profitLoss >= 0 ? '#10B981' : '#EF4444' }}>
              {formatCurrency(data.investments.profitLoss)}
            </strong></div>
          </div>
        </Card>
        <Card title="Financial Health Score">
          <div className={styles.healthScore}>
            <div className={styles.scoreCircle}>
              {data.financialHealthScore ?? '—'}
            </div>
            <p>{data.financialHealthScore ? 'Your financial health score' : 'Calculate your score in Financial Health'}</p>
          </div>
        </Card>
      </div>

      {data.goalsProgress.length > 0 && (
        <Card title="Goals Progress">
          <div className={styles.goals}>
            {data.goalsProgress.map((g) => (
              <div key={g.id} className={styles.goalItem}>
                <div className={styles.goalHeader}>
                  <span>{g.goalName}</span>
                  <span>{Math.round(g.completionPercentage)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${g.completionPercentage}%` }} />
                </div>
                <div className={styles.goalMeta}>
                  {formatCurrency(g.currentSavings)} / {formatCurrency(g.targetAmount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
