import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import styles from './page.module.scss';

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <section className={styles.welcome}>
      <h2>Welcome back, {session?.user?.name}</h2>
      <p>Select a section from the navigation above</p>
    </section>
  );
};

export default DashboardPage;