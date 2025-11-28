'use client';

import styles from './Footer.module.scss';
import Link from 'next/link';
import { FiInstagram, FiFacebook } from 'react-icons/fi';

const LINKS = [
  { href: '/opportunities', label: 'الفرص المتاحة' },
  { href: '/contact', label: 'تواصل معنا' },
];

const SOCIAL = [
  { href: 'https://www.instagram.com/basmatshababia/', icon: FiInstagram, label: 'انستقرام' },
  { href: 'https://facebook.com', icon: FiFacebook, label: 'فيسبوك' },
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>

          <div className={styles.col}>
            <h4 className={styles.title}>مبادرة بصمات شبابية</h4>
            <p className={styles.desc}> نهدف إلى تعزيز العمل التطوعي وصناعة أثر إيجابي في المجتمع. </p>
          </div>

          <div className={styles.col}>
            <h4 className={styles.title}>روابط مهمة</h4>
            <ul className={styles.list}>
              {LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.title}>تابعنا</h4>
            <div className={styles.social}>
              {SOCIAL.map(social => (
                <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <social.icon />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className={styles.bottom}>© {new Date().getFullYear()} بصمات شبابية — جميع الحقوق محفوظة</div>
      </div>
    </footer>
  );
};

export default Footer;