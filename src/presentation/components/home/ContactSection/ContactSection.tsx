'use client';

import styles from './ContactSection.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FiMail, FiUser, FiMessageCircle } from 'react-icons/fi';

const ContactSection = () => {
  return (
    <section className={styles.section}>
      <Container>

        <SectionHeader
          title="تواصل معنا"
          subtitle="يسعدنا التواصل معك والإجابة على جميع استفساراتك"
        />

        <form className={styles.form}>

          <div className={styles.field}>
            <FiUser className={styles.icon} />
            <input
              type="text"
              aria-label="الاسم الكامل"
              className={styles.inputBase}
            />
          </div>

          <div className={styles.field}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              aria-label="البريد الإلكتروني"
              className={styles.inputBase}
            />
          </div>

          <div className={styles.field}>
            <FiMessageCircle className={styles.icon} />
            <textarea
              aria-label="نص الرسالة"
              className={styles.inputBase}
            ></textarea>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            aria-label="إرسال الرسالة"
          >
            إرسال الرسالة
          </button>

        </form>

      </Container>
    </section>
  );
};

export default ContactSection;
