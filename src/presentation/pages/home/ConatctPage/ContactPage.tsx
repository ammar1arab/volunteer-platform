'use client';
import styles from './ContactPage.module.scss';
import { ContactSection } from '@/presentation/components';

const ContactPage = () => {
  return (
    <main className={styles.page}>
      <ContactSection />
    </main>
  );
};

export default ContactPage;