'use client';
import styles from './ContactSection.module.scss';
import { Container, SectionHeader, Button, StatusBubble } from '@/presentation/components';
import { FiMail, FiUser, FiMessageCircle, FiSend } from 'react-icons/fi';
import { Mail } from 'lucide-react';
import { useContactLogic } from './ContactSection.logic';

const ContactSection = () => {
  const { form, status, errorMsg, handleChange, handleSubmit, resetStatus } = useContactLogic();

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.badge}>
          <Mail size={13} />
          نحن هنا للمساعدة
        </div>
        <SectionHeader
          title="تواصل معنا"
          subtitle="يسعدنا التواصل معك والإجابة على جميع استفساراتك"
        />
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>الاسم الكامل</label>
              <div className={styles.inputWrapper}>
                <FiUser size={16} className={styles.icon} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="اسمك.."
                  className={styles.inputBase}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>البريد الإلكتروني</label>
              <div className={styles.inputWrapper}>
                <FiMail size={16} className={styles.icon} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="بريدك.."
                  className={styles.inputBase}
                  required
                />
              </div>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>رسالتك</label>
            <div className={styles.inputWrapper}>
              <FiMessageCircle size={16} className={styles.textareaIcon} />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="رسالتك.."
                className={styles.inputBase}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<FiSend size={15} />}
            iconPosition="left"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
          </Button>
        </form>
      </Container>
      {status === 'success' && <StatusBubble type="success" message="تم إرسال رسالتك بنجاح!" onDone={resetStatus} />}
      {status === 'error'   && <StatusBubble type="error" message={errorMsg} onDone={resetStatus} />}
    </section>
  );
};

export default ContactSection;