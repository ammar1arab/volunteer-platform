'use client';

import { useSession } from 'next-auth/react';
import { Activity, Star, Users, BarChart3 } from 'lucide-react';
import { Container } from '@/presentation/components';
import styles from './page.module.scss';

const ICON_MAP = {
  activity: Activity,
  star: Star,
  users: Users,
  chart: BarChart3,
};

const CARDS = [
  {
    id: 'activities',
    title: 'الأنشطة',
    description: 'إدارة الأنشطة التطوعية',
    icon: 'activity',
  },
  {
    id: 'featured',
    title: 'البصمات المميزة',
    description: 'إضافة البصمات المميزة',
    icon: 'star',
  },
  {
    id: 'volunteers',
    title: 'المتطوعين',
    description: 'إدارة المتطوعين',
    icon: 'users',
  },
  {
    id: 'reports',
    title: 'التقارير',
    description: 'عرض الإحصائيات',
    icon: 'chart',
  },
];

const AdminDashboard = () => {
  const { data: session } = useSession();

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>لوحة التحكم</h1>
          <p className={styles.welcome}>{session?.user?.name}</p>
        </div>

        <div className={styles.grid}>
          {CARDS.map((card, index) => {
            const Icon = ICON_MAP[card.icon as keyof typeof ICON_MAP];
            return (
              <div
                key={card.id}
                className={styles.card}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} size={32} />
                </div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;