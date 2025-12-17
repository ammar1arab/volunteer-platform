'use client';

import { Activity, Star, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { Container } from '@/presentation/components';
import type { DashboardCard } from '@/lib/types';
import styles from './page.module.scss';

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: 'activities',
    title: 'الأنشطة',
    description: 'إدارة جميع الأنشطة التطوعية',
    icon: 'activity',
  },
  {
    id: 'featured',
    title: 'البصمات المميزة',
    description: 'إضافة وتعديل البصمات المميزة',
    icon: 'star',
  },
  {
    id: 'volunteers',
    title: 'المتطوعين',
    description: 'عرض وإدارة المتطوعين',
    icon: 'users',
  },
  {
    id: 'reports',
    title: 'التقارير',
    description: 'عرض الإحصائيات والتقارير',
    icon: 'chart',
  },
];

const ICON_MAP = {
  activity: Activity,
  star: Star,
  users: Users,
  chart: BarChart3,
};

const AdminDashboard = () => {
  const { session, isLoading } = useAuth({
    requireAuth: true,
    requireRole: 'ADMIN',
  });

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper} role="status" aria-live="polite">
        <p className={styles.loadingText}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Container>
        <main className={styles.contentWrapper} role="main">
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>لوحة التحكم - الإدارة</h1>
            <p className={styles.welcomeText}>
              مرحباً، <strong>{session?.user?.name}</strong>
            </p>
          </header>

          <section className={styles.cardsGrid} aria-label="إحصائيات لوحة التحكم">
            {DASHBOARD_CARDS.map((card, index) => {
              const IconComponent = ICON_MAP[card.icon as keyof typeof ICON_MAP];
              
              return (
                <article
                  key={card.id}
                  className={styles.dashboardCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardIconWrapper}>
                    <IconComponent className={styles.cardIcon} size={32} aria-hidden="true" />
                  </div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </article>
              );
            })}
          </section>
        </main>
      </Container>
    </div>
  );
};

export default AdminDashboard;