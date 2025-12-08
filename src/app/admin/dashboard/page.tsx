import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import styles from './dashboard.module.scss';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/admin/login');
  }

  // Get initials for avatar
  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'AD';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>V</div>
          <div className={styles.brandText}>
            <h1>Volunteer Platform</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <p>Welcome back</p>
            <h3>{session.user.name}</h3>
          </div>
          <div className={styles.avatar}>{initials}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h2 className={styles.greeting}>
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'} 👋
          </h2>
          <p className={styles.subtext}>
            Here's what's happening with your platform today
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <p className={styles.statLabel}>Total Volunteers</p>
            <h3 className={styles.statValue}>0</h3>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <p className={styles.statLabel}>Active Activities</p>
            <h3 className={styles.statValue}>0</h3>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏱️</div>
            <p className={styles.statLabel}>Total Hours</p>
            <h3 className={styles.statValue}>0h</h3>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>
            Create Activity
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`}>
            View Reports
          </button>
          <form action="/api/auth/signout" method="POST" style={{ display: 'inline' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnDanger}`}>
              Sign Out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}