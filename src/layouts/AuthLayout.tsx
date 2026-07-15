import { Outlet, Link } from 'react-router-dom';
import styles from './AuthLayout.module.scss';

export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>FinPilot AI</h1>
          <p>Smart financial planning for you & your family</p>
        </div>
        <div className={styles.card}>
          <Outlet />
        </div>
        <div className={styles.footer}>
          <Link to="/login">Login</Link> · <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
