import { useQuery } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { Card, Loader, StatCard } from '@/components/ui';
import { BarChartWidget } from '@/components/charts/ChartWidgets';
import { formatCurrency } from '@/utils/format';
import styles from '../dashboard/DashboardPage.module.scss';

export function FamilyDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['family-dashboard'],
    queryFn: async () => (await financialApi.getFamilyDashboard()).data.data.dashboard,
  });

  if (isLoading) return <Loader fullPage />;

  if (isError || !data) {
    return (
      <Card title="Family Dashboard">
        <p style={{ color: '#64748B', marginBottom: 12 }}>
          {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Unable to load the family dashboard.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </Card>
    );
  }

  const breakdown = data.profileBreakdown || [];
  const charts = data.charts || { incomeByType: [], expenseByCategory: [] };

  const profileChart = breakdown.map((p) => ({
    name: p.name,
    income: p.income,
    expenses: p.expenses,
    savings: p.savings,
  }));

  const incomeByMember =
    charts.incomeByMember || profileChart.map((p) => ({ name: p.name, value: p.income }));
  const expenseByMember =
    charts.expenseByMember || profileChart.map((p) => ({ name: p.name, value: p.expenses }));

  const comparison = data.comparison;
  const totalIncome = comparison?.totalIncome ?? comparison?.combinedIncome ?? data.monthlyIncome;
  const totalExpenses =
    comparison?.totalExpenses ?? comparison?.combinedExpenses ?? data.monthlyExpenses;
  const totalSavings =
    comparison?.totalSavings ?? comparison?.combinedSavings ?? data.savings;
  const avgSavingsRate =
    comparison?.avgSavingsRate ?? data.savingsRate ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        <StatCard
          label="Combined Income"
          value={formatCurrency(data.monthlyIncome)}
          icon="💰"
          iconColor="green"
        />
        <StatCard
          label="Combined Expenses"
          value={formatCurrency(data.monthlyExpenses)}
          icon="💳"
          iconColor="orange"
        />
        <StatCard
          label="Combined Savings"
          value={formatCurrency(data.savings)}
          icon="🏦"
          iconColor="blue"
        />
        <StatCard
          label="Combined Investments"
          value={formatCurrency(data.investments?.totalCurrent ?? 0)}
          icon="📈"
          iconColor="green"
        />
      </div>

      <Card title="Family Comparison">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total Income</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(totalIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total Expenses</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(totalExpenses)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total Savings</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: totalSavings >= 0 ? '#10B981' : '#EF4444',
              }}
            >
              {formatCurrency(totalSavings)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Avg Savings Rate</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{Number(avgSavingsRate).toFixed(1)}%</div>
          </div>
          {comparison?.topEarner && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Top Earner</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {comparison.topEarner.name} ({formatCurrency(comparison.topEarner.income)})
              </div>
            </div>
          )}
          {comparison?.topSpender && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Top Spender</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {comparison.topSpender.name} ({formatCurrency(comparison.topSpender.expenses)})
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className={styles.grid}>
        <Card title="Income by Member">
          <BarChartWidget data={incomeByMember} title="" />
        </Card>
        <Card title="Expenses by Member">
          <BarChartWidget data={expenseByMember} title="" />
        </Card>
      </div>

      <div className={styles.grid}>
        <Card title="Profile-wise Summary">
          {breakdown.length === 0 ? (
            <p style={{ color: '#64748B' }}>No profiles yet. Add family members on Profiles.</p>
          ) : (
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 0' }}>Member</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Savings</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((p) => (
                  <tr key={String(p.profileId)} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>
                      {p.name}{' '}
                      <span style={{ color: '#64748B', fontWeight: 400 }}>({p.relation})</span>
                    </td>
                    <td>{formatCurrency(p.income)}</td>
                    <td>{formatCurrency(p.expenses)}</td>
                    <td style={{ color: p.savings >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(p.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Combined Expense Categories">
          <BarChartWidget data={charts.expenseByCategory || []} />
        </Card>
      </div>
    </div>
  );
}
