'use client';
import styles from './Header.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ROUTES } from '@/presentation/constants';
import { Button, ConfirmDialog } from '@/presentation/components';
import { User, LogOut } from 'lucide-react';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';

const NAV_LINKS = [
  { href: ROUTES.ACTIVITIES, label: 'الفرص التطوعية' },
  { href: ROUTES.POSTS, label: 'المنشورات' },
  { href: ROUTES.SPOTLIGHT.BASE, label: 'أبرز المتطوعين' },
  { href: ROUTES.MAGAZINES, label: 'حصاد العطاء' },
  { href: ROUTES.ABOUT, label: 'من نحن' },
  { href: '/#contact', label: 'تواصل معنا' },
];

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isVolunteer = session?.user?.role === 'VOLUNTEER';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname === '/signin' || pathname === '/signup') return null;

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <nav className={styles.nav}>

            <Link href="/" className={styles.logoDesktop}>
              <Image src="/images/logo.png" alt="Logo" width={90} height={0} style={{ height: "auto" }} loading="eager" priority />
            </Link>

            <ul className={styles.navLinks}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              {isVolunteer ? (
                <>
                  <Link href={ROUTES.VOLUNTEER.PROFILE} className={styles.iconBtn} title="الملف الشخصي">
                    <User size={20} />
                  </Link>
                  <button
                    className={styles.desktopLogoutBtn}
                    onClick={() => setShowLogoutConfirm(true)}
                    title="تسجيل الخروج"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link href={ROUTES.LOGIN}>
                  <Button variant="primary" size="md">تسجيل الدخول</Button>
                </Link>
              )}
            </div>

            <div className={styles.mobileBar}>
              <Link href="/" className={styles.mobileLogo}>
                <Image src="/images/logo.png" alt="Logo" width={90} height={0} style={{ height: "auto" }} loading="eager" priority />
              </Link>
              <div className={styles.mobileRight}>
                {isVolunteer ? (
                  <Link href={ROUTES.VOLUNTEER.PROFILE} className={styles.mobileIconBtn} title="الملف الشخصي">
                    <User size={18} />
                  </Link>
                ) : (
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="primary" size="sm">تسجيل الدخول</Button>
                  </Link>
                )}
                <button
                  className={styles.menuBtn}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <RxCross2 size={22} /> : <RxHamburgerMenu size={22} />}
                </button>
              </div>
            </div>

          </nav>

          {menuOpen && (
            <div className={styles.mobileMenu}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobileLink} ${pathname === link.href ? styles.activeMobile : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {isVolunteer && (
                <button className={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              )}
            </div>
          )}

        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => signOut({ callbackUrl: '/' })}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        variant="danger"
      />
    </>
  );
};

export default Header;