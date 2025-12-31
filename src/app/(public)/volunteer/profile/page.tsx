'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, Mail, Phone, Shield, Clock, Target, Award, Calendar, LogOut, FileText } from 'lucide-react';
import { Container, LoadingState } from '@/presentation/components';
import { userApi } from '@/lib/api';
import { ROUTES } from '@/lib';
import type { UserProfileDto } from '@/core/application/dtos';
import styles from './page.module.scss';

const VolunteerProfile = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userApi.getProfile();
        if (response.success && response.user) {
          setProfile(response.user);
        } else {
          setError(response.error || 'فشل تحميل البيانات');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const personalInfo = [
    { 
      icon: User, 
      label: 'الاسم الكامل', 
      value: profile?.fullName || 'غير متوفر' 
    },
    { 
      icon: Mail, 
      label: 'البريد الإلكتروني', 
      value: profile?.email || 'غير متوفر' 
    },
    { 
      icon: Phone, 
      label: 'رقم الهاتف', 
      value: profile?.phone || 'غير متوفر' 
    },
    { 
      icon: Shield, 
      label: 'الدور', 
      value: profile?.role === 'VOLUNTEER' ? 'متطوع' : 'مستخدم' 
    },
  ];

  const statistics = [
    {
      icon: Clock,
      value: '0',
      label: 'ساعات تطوعية',
      color: '#10b981',
    },
    {
      icon: Target,
      value: '0',
      label: 'أنشطة مكتملة',
      color: '#3b82f6',
    },
    {
      icon: Award,
      value: '0',
      label: 'شهادات تقدير',
      color: '#f59e0b',
    },
    {
      icon: Calendar,
      value: '0',
      label: 'أنشطة معلقة',
      color: '#8b5cf6',
    },
  ];

  if (loading) {
    return <LoadingState message="جاري تحميل البيانات..." />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Container>
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>الملف الشخصي</h1>
          </div>
          <div className={styles.pageActions}>
            <Link href={ROUTES.VOLUNTEER.REQUESTS} className={styles.navBtn}>
              <FileText size={18} />
              طلباتي
            </Link>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className={styles.headerCard}>
          <div className={styles.profileAvatar}>
            <div className={styles.avatarCircle}>
              <User size={48} strokeWidth={2} />
            </div>
            <div className={styles.avatarGlow} />
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profile?.fullName || 'متطوع'}</h2>
            <div className={styles.profileBadge}>
              <Shield size={14} />
              <span>متطوع نشط</span>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>المعلومات الشخصية</h3>
              <div className={styles.cardDecor} />
            </div>
            <div className={styles.infoList}>
              {personalInfo.map((item) => (
                <div key={item.label} className={styles.infoItem}>
                  <div className={styles.infoIconWrapper}>
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>{item.label}</span>
                    <span className={styles.infoValue}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>الإحصائيات</h3>
              <div className={styles.cardDecor} />
            </div>
            <div className={styles.statsGrid}>
              {statistics.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={styles.statItem}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div 
                    className={styles.statIcon}
                    style={{ background: `${stat.color}15` }}
                  >
                    <stat.icon size={24} color={stat.color} strokeWidth={2.5} />
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue} style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.comingSoonCard}>
          <div className={styles.comingSoonIcon}>
            <Target size={32} />
          </div>
          <h3 className={styles.comingSoonTitle}>المزيد من الميزات قريباً</h3>
          <p className={styles.comingSoonText}>
            سيتم إضافة صورة الملف الشخصي، السيرة الذاتية، الاهتمامات، والمزيد من التفاصيل قريباً
          </p>
        </div>
      </Container>
    </div>
  );
};

export default VolunteerProfile;