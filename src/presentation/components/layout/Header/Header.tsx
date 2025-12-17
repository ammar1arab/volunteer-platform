'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import styles from './Header.module.scss';

const Header = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const socialRef = useRef<HTMLLIElement | null>(null);

  const navLinks = useMemo(
    () => [
      { href: '/opportunities', label: 'الفرص' },
      { href: '/members', label: 'الأعضاء' },
      { href: '/about', label: 'من نحن' },
      { href: '/contact', label: 'تواصل معنا' },
    ],
    []
  );

  const socialLinks = useMemo(
    () => [
      { href: 'https://www.facebook.com/p/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D8%A8%D8%B5%D9%85%D8%A7%D8%AA-%D8%B4%D8%A8%D8%A7%D8%A8%D9%8A%D8%A9-100063497834494/', label: 'فيسبوك', title: 'Facebook' },
      { href: 'https://www.instagram.com/basmatshababia/', label: 'انستقرام', title: 'Instagram' },
    ],
    []
  );

  useEffect(() => {
    setMenuOpen(false);
    setSocialOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!socialRef.current) return;
      if (!socialRef.current.contains(e.target as Node)) setSocialOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.logoDesktop} title="الرئيسية">
            <Image src="/images/logo.png" alt="Logo" width={100} height={50} priority />
          </Link>

          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={link.label}
                  className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className={styles.socialWrapper} ref={socialRef}>
              <button
                type="button"
                className={styles.socialToggle}
                onClick={() => setSocialOpen((v) => !v)}
                aria-expanded={socialOpen}
                title="مواقعنا للتواصل الاجتماعي"
              >
                مواقعنا
              </button>

              {socialOpen && (
                <div className={styles.socialMenu} role="menu">
                  {socialLinks.map((s) => (
                    <a
                      key={s.title}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title={s.title}
                      role="menuitem"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </li>
          </ul>

          <div className={styles.actions}>
            <Link href="/login" className={styles.loginBtn} title="تسجيل الدخول">
              تسجيل الدخول
            </Link>
          </div>

          <div className={styles.mobileBar}>
            <Link href="/" className={styles.mobileLogo} title="الرئيسية">
              <Image src="/images/logo.png" alt="Logo" width={90} height={45} priority />
            </Link>

            <div className={styles.mobileRight}>
              <Link
                href="/login"
                className={styles.mobileLogin}
                title="تسجيل الدخول"
              >
                تسجيل الدخول
              </Link>

              <button
                type="button"
                className={styles.menuBtn}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setSocialOpen(false);
                }}
                aria-expanded={menuOpen}
                title={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {menuOpen ? <RxCross2 size={22} /> : <RxHamburgerMenu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`${styles.mobileLink} ${pathname === link.href ? styles.activeMobile : ''}`}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              className={styles.mobileLink}
              onClick={() => setSocialOpen((v) => !v)}
              aria-expanded={socialOpen}
              title="مواقعنا للتواصل الاجتماعي"
            >
              مواقعنا
            </button>

            {socialOpen && (
              <div className={styles.mobileSocialMenu}>
                {socialLinks.map((s) => (
                  <a
                    key={s.title}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={s.title}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
