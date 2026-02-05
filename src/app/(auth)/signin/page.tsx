'use client';
import styles from './page.module.scss';
import { useSignin } from './page.logic';

import Link from 'next/link';
import { Input, Button } from '@/presentation/components';

const SigninPage = () => {
  const { formData, error, loading, handleChange, handleSubmit } = useSignin();

  return (
    <div className={styles.page}>
      <main className={styles.card} aria-labelledby="signin-title">
        <header className={styles.header}>
          <h1 id="signin-title" className={styles.title}>تسجيل الدخول</h1>
          <p className={styles.subtitle}>مرحباً بعودتك</p>
        </header>

        {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate autoComplete="on">
          <Input
            label="البريد الإلكتروني"
            type="email"
            name="email"
            autoComplete="username"
            dir="rtl"
            value={formData.email}
            onChange={(e: { target: { value: string; }; }) => handleChange('email', e.target.value)}
            required
            aria-required="true"
          />

          <Input
            label="كلمة المرور"
            type="password"
            name="password"
            autoComplete="current-password"
            dir="rtl"
            value={formData.password}
            onChange={(e: { target: { value: string; }; }) => handleChange('password', e.target.value)}
            required
            aria-required="true"
          />

          <Button type="submit" loading={loading} aria-busy={loading} disabled={loading}>
            تسجيل الدخول
          </Button>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>ليس لديك حساب؟</span>
          <Link href="/signup" className={styles.footerLink}>إنشاء حساب</Link>
        </footer>
      </main>
    </div>
  );
};

export default SigninPage;
