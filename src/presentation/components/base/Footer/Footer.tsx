'use client';

import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.title}>مبادرة بصمات شبابية</h3>
            <p className={styles.desc}>تعزيز العمل التطوعي وصناعة أثر إيجابي</p>
          </div>

          <div className={styles.links}>
            <Link href="/#opportunities">الفرص المتاحة</Link>
            <Link href="/#contact">تواصل معنا</Link>
          </div>

          <div className={styles.social}>
            <a
              href="https://www.instagram.com/basmatshababia/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="انستقرام"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/p/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D8%A8%D8%B5%D9%85%D8%A7%D8%AA-%D8%B4%D8%A8%D8%A7%D8%A8%D9%8A%D8%A9-100063497834494/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="فيسبوك"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} بصمات شبابية
        </div>
      </div>
    </footer>
  );
};

export default Footer;