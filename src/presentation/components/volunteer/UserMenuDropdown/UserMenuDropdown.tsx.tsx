'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, CalendarDays, Award, LogOut } from 'lucide-react';
import styles from './UserMenuDropdown.module.scss';
import { ROUTES } from '@/presentation/constants';

interface Props {
  userName: string;
  avatarUrl?: string | null;
  onClose: () => void;
  onLogout: () => void;
}

const LINKS = [
  { href: ROUTES.VOLUNTEER.PROFILE,      icon: <User size={15} />,        label: 'الملف الشخصي' },
  { href: ROUTES.VOLUNTEER.ACTIVITIES,   icon: <CalendarDays size={15} />, label: 'فرصي التطوعية' },
  { href: ROUTES.VOLUNTEER.CERTIFICATES, icon: <Award size={15} />,        label: 'شهاداتي' },
];

const UserMenuDropdown = ({ userName, avatarUrl, onLogout }: Props) => {
  return (
    <div className={styles.dropdown}>

      {/* ── User info ── */}
      <div className={styles.userInfo}>
        <div className={styles.avatarWrap}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={userName} width={38} height={38} className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitial}>
              {userName.charAt(0).toUpperCase() || 'أ'}
            </span>
          )}
        </div>
        <div className={styles.userMeta}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>متطوع</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Links ── */}
      <div className={styles.list}>
        {LINKS.map(link => (
          <Link key={link.href} href={link.href} className={styles.item}>
            <span className={styles.itemIcon}>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className={styles.divider} />

      {/* ── Logout ── */}
      <button className={styles.logoutItem} onClick={onLogout}>
        <span className={styles.itemIcon}><LogOut size={15} /></span>
        <span>تسجيل الخروج</span>
      </button>

    </div>
  );
};

export default UserMenuDropdown;