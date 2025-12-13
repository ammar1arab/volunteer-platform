import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import styles from './layout.module.scss';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <h1>Admin</h1>
        </div>
        
        <ul className={styles.links}>
          <li><Link href="/admin/dashboard">Dashboard</Link></li>
          <li><Link href="/admin/dashboard/activities">Activities</Link></li>
          <li><Link href="/admin/dashboard/featured">Featured</Link></li>
          <li><Link href="/admin/dashboard/members">Members</Link></li>
        </ul>

        <form action="/api/auth/signout" method="POST">
          <button type="submit">Sign Out</button>
        </form>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default DashboardLayout;