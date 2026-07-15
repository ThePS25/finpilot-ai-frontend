import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useProfileStore, useUIStore } from '@/store';
import { profileApi } from '@/api/profile.api';
import { financialApi } from '@/api/financial.api';
import { Button } from '@/components/ui';
import { formatDate } from '@/utils/format';
import styles from './DashboardLayout.module.scss';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/profiles', label: 'Profiles', icon: '👥' },
  { to: '/income', label: 'Income', icon: '💰' },
  { to: '/expenses', label: 'Expenses', icon: '💳' },
  { to: '/investments', label: 'Investments', icon: '📈' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/debts', label: 'Debts', icon: '🏦' },
  { to: '/budgets', label: 'Budgets', icon: '📋' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/family', label: 'Family Dashboard', icon: '🏠' },
  { to: '/payslips', label: 'Payslips', icon: '📄' },
  { to: '/health', label: 'Financial Health', icon: '❤️' },
  { to: '/coach', label: 'AI Coach', icon: '🤖' },
  { to: '/simulator', label: 'Simulator', icon: '🔮' },
  { to: '/insights', label: 'Insights', icon: '💡' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function NotificationsBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await financialApi.getNotifications({ limit: 20 })).data.data.notifications,
    refetchInterval: 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => financialApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => financialApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={styles.notifications} ref={panelRef}>
      <button className={styles.bellBtn} onClick={() => setOpen(!open)} title="Notifications">
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.notifPanel}>
          <div className={styles.notifHeader}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMutation.mutate()} className={styles.markAll}>
                Mark all read
              </button>
            )}
          </div>
          <div className={styles.notifList}>
            {(notifications || []).length === 0 && (
              <p className={styles.notifEmpty}>No notifications</p>
            )}
            {(notifications || []).map((n) => (
              <div key={n._id} className={`${styles.notifItem} ${n.isRead ? '' : styles.unread}`}>
                <div className={styles.notifContent} onClick={() => !n.isRead && markReadMutation.mutate(n._id)}>
                  <div className={styles.notifTitle}>{n.title}</div>
                  <div className={styles.notifMsg}>{n.message}</div>
                  <div className={styles.notifDate}>{formatDate(n.createdAt)}</div>
                </div>
                <button className={styles.notifDelete} onClick={() => deleteMutation.mutate(n._id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { profiles, activeProfileId, setProfiles, setActiveProfile } = useProfileStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data } = await profileApi.getAll();
      setProfiles(data.data.profiles);
      return data.data.profiles;
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pageTitle = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label || 'FinPilot AI';

  return (
    <div className={styles.layout}>
      <div className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <h1>FinPilot AI</h1>
          <span>Personal Finance Platform</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div className={styles.userInfo}>
              <div className={styles.name}>{user?.name}</div>
              <div className={styles.email}>{user?.email}</div>
            </div>
          </div>
          <Button variant="ghost" fullWidth onClick={handleLogout} style={{ marginTop: 8 }}>
            Logout
          </Button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className={styles.menuBtn} onClick={toggleSidebar}>☰</button>
            <h2 className={styles.pageTitle}>{pageTitle}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationsBell />
            {profiles.length > 0 && (
              <select
                className={styles.profileSelect}
                value={activeProfileId || ''}
                onChange={(e) => setActiveProfile(e.target.value || null)}
              >
                <option value="">All Profiles</option>
                {profiles.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.relation})</option>
                ))}
              </select>
            )}
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
