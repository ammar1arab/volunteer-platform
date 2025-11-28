'use client';

import styles from './Header.module.scss';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import { FaInstagram, FaFacebookF } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

const Header = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "الرئيسية", href: "/" },
    { label: "الفرص", href: "/opportunities" },
    { label: "الأعضاء", href: "/members" },
    { label: "من نحن", href: "/about" },
    { label: "تواصل معنا", href: "/contact" },
  ];

  return (
    <header className={styles.header}>
      <div className="container">

        <nav className={styles.nav}>
          {/* ================= MOBILE BAR ================= */}
          <div className={styles.mobileBar}>
            <div className={styles.leftIcons}>
              <a href="https://www.instagram.com/basmatshababia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${styles.mobileIcon} ${styles.instabg}`}>
                <FaInstagram size={16} color="#fff" />
              </a>

              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`${styles.mobileIcon} ${styles.fbBg}`}>
                <FaFacebookF size={16} color="#fff" />
              </a>
            </div>

            <Link href="/" aria-label="الرئيسية" className={styles.mobileLogoWrapper}>
              <Image src="/images/logo.png" alt="Logo" width={90} height={50} className={styles.logoMobile} />
            </Link>

            <div className={styles.rightIcons}>
              <Link href="/login" aria-label="Login" className={`${styles.mobileIcon} ${styles.loginBg}`}>
                <FiUser size={18} color="#fff" />
              </Link>

              <button type="button" aria-label="Menu" className={styles.menuBtn} onClick={() => setOpen(!open)}>
                {open
                  ? <RxCross2 size={24} className={styles.menuIconOpen} />
                  : <RxHamburgerMenu size={24} className={styles.menuIcon} />}
              </button>
            </div>
          </div>

          <Link href="/" aria-label="الرئيسية" className={styles.logoDesktop}>
            <Image src="/images/logo.png" alt="Logo" width={100} height={50} />
          </Link>

          <ul className={styles.navLinks}>
            {links.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navItem}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.desktopSocial}>
            <a href="https://www.instagram.com/basmatshababia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${styles.icon} ${styles.instabg}`}>
              <FaInstagram size={20} color="#fff" />
            </a>

            <a
              href="https://www.facebook.com/p/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D8%A8%D8%B5%D9%85%D8%A7%D8%AA-%D8%B4%D8%A8%D8%A7%D8%A8%D9%8A%D8%A9-100063497834494/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={`${styles.icon} ${styles.fbBg}`}
            >
              <FaFacebookF size={20} color="#fff" />
            </a>

            <Link href="/login" aria-label="Login" className={`${styles.icon} ${styles.loginBg}`}>
              <FiUser size={20} color="#fff" />
            </Link>
          </div>
        </nav>

        {open && (
          <div className={styles.mobileMenu}>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
