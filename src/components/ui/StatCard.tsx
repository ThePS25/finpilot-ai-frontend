import styles from './StatCard.module.scss';

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  iconColor?: 'blue' | 'green' | 'orange' | 'red';
  change?: { value: string; trend: 'up' | 'down' };
}

export function StatCard({ label, value, icon, iconColor = 'blue', change }: StatCardProps) {
  return (
    <div className={styles.stat}>
      {icon && <div className={`${styles.icon} ${styles[iconColor]}`}>{icon}</div>}
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {change && (
        <div className={`${styles.change} ${styles[change.trend]}`}>
          {change.trend === 'up' ? '↑' : '↓'} {change.value}
        </div>
      )}
    </div>
  );
}
