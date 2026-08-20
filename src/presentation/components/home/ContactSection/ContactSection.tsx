'use client';
import styles from './ContactSection.module.scss';
import { Container, SectionHeader, Button, StatusBubble } from '@/presentation/components';
import { FiMail, FiUser, FiMessageCircle, FiSend } from 'react-icons/fi';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContactLogic } from './ContactSection.logic';

const ContactSection = () => {
  const { form, errors, touched, status, errorMsg, handleChange, handleBlur, handleSubmit, resetStatus } = useContactLogic();

  const fieldState = (field: 'name' | 'email' | 'message') => {
    if (!touched[field]) return 'idle';
    return errors[field] ? 'error' : 'success';
  };

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

            <Field label="الاسم الكامل" error={touched.name ? errors.name : undefined} state={fieldState('name')}>
              <div className={`${styles.inputWrapper} ${styles[fieldState('name')]}`}>
                <FiUser size={16} className={styles.icon} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="اسمك.."
                  className={styles.inputBase}
                />
                <StateIcon state={fieldState('name')} />
              </div>
            </Field>

            <Field label="البريد الإلكتروني" error={touched.email ? errors.email : undefined} state={fieldState('email')}>
              <div className={`${styles.inputWrapper} ${styles[fieldState('email')]}`}>
                <FiMail size={16} className={styles.icon} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="بريدك.."
                  className={styles.inputBase}
                />
                <StateIcon state={fieldState('email')} />
              </div>
            </Field>

          </div>

          <Field label="رسالتك" error={touched.message ? errors.message : undefined} state={fieldState('message')}>
            <div className={`${styles.inputWrapper} ${styles[fieldState('message')]}`}>
              <FiMessageCircle size={16} className={styles.textareaIcon} />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="رسالتك.."
                className={styles.inputBase}
              />
              <StateIcon state={fieldState('message')} textarea />
            </div>
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<FiSend size={15} />}
            iconPosition="left"
            disabled={status === 'loading'}
            style={{ justifySelf: 'center' }}
          >
            {status === 'loading' ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
          </Button>
        </form>
      </Container>

      {status === 'success' && <StatusBubble type="success" message="تم إرسال رسالتك بنجاح!" onDone={resetStatus} />}
      {status === 'error'   && <StatusBubble type="error"   message={errorMsg}               onDone={resetStatus} />}
    </section>
  );
};

export default ContactSection;

const Field = ({ label, error, state, children }: {
  label:    string;
  error?:   string;
  state:    'idle' | 'error' | 'success';
  children: React.ReactNode;
}) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}</label>
    {children}
    {state === 'error' && error && (
      <span className={styles.errorMsg}>
        <AlertCircle size={12} /> {error}
      </span>
    )}
  </div>
);

const StateIcon = ({ state, textarea }: { state: 'idle' | 'error' | 'success'; textarea?: boolean }) => {
  if (state === 'idle') return null;
  return (
    <span className={`${styles.stateIcon} ${textarea ? styles.stateIconTextarea : ''}`}>
      {state === 'success'
        ? <CheckCircle2 size={15} className={styles.iconSuccess} />
        : <AlertCircle  size={15} className={styles.iconError}   />
      }
    </span>
  );
};