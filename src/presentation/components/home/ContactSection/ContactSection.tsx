'use client';

import styles from './ContactSection.module.scss';
import { Container, SectionHeader, Button } from '@/presentation/components';
import { FiMail, FiUser, FiMessageCircle, FiSend } from 'react-icons/fi';

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
            <label className={styles.label}>الاسم الكامل</label>
            <div className={styles.inputWrapper}>
              <FiUser size={18} className={styles.icon} />
              <input
                type="text"
                placeholder="اسمك.."
                className={styles.inputBase}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <div className={styles.inputWrapper}>
              <FiMail size={18} className={styles.icon} />
              <input
                type="email"
                placeholder="بريدك الإلكتروني.."
                className={styles.inputBase}
              />
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <label className={styles.label}>رسالتك</label>
            <div className={styles.inputWrapper}>
              <FiMessageCircle size={18} className={styles.textareaIcon} />
              <textarea
                placeholder="رسالتك.."
                className={styles.inputBase}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<FiSend size={16} />}
            iconPosition="left"
          >
            إرسال الرسالة
          </Button>

        </form>
      </Container>
    </section>
  );
};

export default ContactSection;