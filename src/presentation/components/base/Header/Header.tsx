'use client';
import styles from './Header.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ROUTES } from '@/presentation/constants';
import { Button, ConfirmDialog, NotificationBell, UserMenuDropdown } from '@/presentation/components';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';

const NAV_LINKS = [
  { href: ROUTES.ACTIVITIES, label: 'الفرص التطوعية' },
  { href: ROUTES.POSTS, label: 'المنشورات' },
  { href: ROUTES.SPOTLIGHT.BASE, label: 'أبرز المتطوعين' },
  { href: ROUTES.MAGAZINES, label: 'حصاد العطاء' },
  { href: ROUTES.ABOUT, label: 'من نحن' },
  { href: ROUTES.CONTACT, label: 'تواصل معنا' },
];

type OpenMenu = 'notifications' | 'user' | null;

interface ActionsProps {
  isLoading: boolean;
  isVolunteer: boolean;
  userName: string;
  userInitial: string;
  avatarUrl: string | null;
  openMenu: OpenMenu;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (menu: OpenMenu) => void;
  onClose: () => void;
  onLogout: () => void;
  mobile?: boolean;
}

const VolunteerActions = ({
  isLoading, isVolunteer, userName, userInitial, avatarUrl,
  openMenu, wrapperRef, onToggle, onClose, onLogout, mobile = false,
}: ActionsProps) => {
  if (isLoading) return <div className={styles.authPlaceholder} />;

  if (!isVolunteer) {
    return (
      <Link href={ROUTES.LOGIN}>
        <Button variant="primary" size={mobile ? 'sm' : 'md'}>تسجيل الدخول</Button>
      </Link>
    );
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <NotificationBell
          isOpen={openMenu === 'notifications'}
          onToggle={() => onToggle('notifications')}
          onClose={onClose}
        />
        <span className={`${styles.caret} ${openMenu === 'notifications' ? styles.caretVisible : ''}`} />
      </div>

      <div className={styles.userMenuWrapper} ref={wrapperRef} style={{ position: "relative" }}>
        <button
          className={[
            mobile ? styles.avatarBtnSm : styles.avatarBtn,
            openMenu === 'user' ? styles.avatarBtnActive : '',
          ].join(' ')}
          onClick={() => onToggle('user')}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={mobile ? 30 : 34}
              height={mobile ? 30 : 34}
              className={styles.avatarImg}
            />
          ) : (
            <span className={styles.avatarInitial}>{userInitial}</span>
          )}
        </button>
        <span className={`${styles.caret} ${openMenu === 'user' ? styles.caretVisible : ''}`} />
        {openMenu === 'user' && (
          <UserMenuDropdown
            userName={userName}
            avatarUrl={avatarUrl}
            onClose={() => onToggle('user')}
            onLogout={onLogout}
          />
        )}
      </div>
    </>
  );
};

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [showLogout, setShowLogout] = useState(false);

  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'loading';
  const isVolunteer = status === 'authenticated' && session?.user?.role === 'VOLUNTEER';
  const userName = session?.user?.name ?? '';
  const userInitial = userName.charAt(0).toUpperCase() || 'أ';
  const avatarUrl = (session?.user as any)?.profilePictureUrl ?? null;

  useEffect(() => { setMenuOpen(false); setOpenMenu(null); }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!desktopRef.current?.contains(t) && !mobileRef.current?.contains(t)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const toggle = (menu: OpenMenu) => {
    setMenuOpen(false);
    setOpenMenu(prev => prev === menu ? null : menu);
  };

  const toggleBurger = () => {
    setOpenMenu(null);
    setMenuOpen(p => !p);
  };

  const handleLogout = () => { setOpenMenu(null); setShowLogout(true); };

  if (pathname === '/signin' || pathname === '/signup') return null;

  const sharedProps: ActionsProps = {
    isLoading, isVolunteer, userName, userInitial, avatarUrl,
    openMenu,
    onToggle: toggle,
    onClose: () => setOpenMenu(null),
    onLogout: handleLogout,
    wrapperRef: desktopRef,
  };

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <nav className={styles.nav}>

            <Link href="/" className={styles.logoDesktop}>
              <Image src="/images/logo.png" alt="Logo" width={90} height={0}
                style={{ height: 'auto' }} loading="eager" priority />
            </Link>

            <ul className={styles.navLinks}>
              {NAV_LINKS.map(link => (
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
              <VolunteerActions {...sharedProps} />
            </div>

            <div className={styles.mobileBar}>
              <Link href="/" className={styles.mobileLogo}>
                <Image src="/images/logo.png" alt="Logo" width={80} height={0}
                  style={{ height: 'auto' }} loading="eager" priority />
              </Link>
              <div className={styles.mobileRight}>
                <VolunteerActions {...sharedProps} wrapperRef={mobileRef} mobile />
                <button
                  className={styles.menuBtn}
                  onClick={toggleBurger}
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <RxCross2 size={22} /> : <RxHamburgerMenu size={22} />}
                </button>
              </div>
            </div>

          </nav>

          {menuOpen && (
            <div className={styles.mobileMenu}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobileLink} ${pathname === link.href ? styles.activeMobile : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
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