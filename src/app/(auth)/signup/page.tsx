'use client';

import Link from 'next/link';
import { Input, Button } from '@/presentation/components';
import { useSignup } from '@/presentation/hooks';
import styles from './page.module.scss';

const SignupPage = () => {
  const { formData, error, loading, handleChange, handleSubmit } = useSignup();

  return (
    <div className={styles.page}>
      <main className={styles.card} aria-labelledby="signup-title">
        <header className={styles.header}>
          <h1 id="signup-title" className={styles.title}>إنشاء حساب جديد</h1>
        </header>

        {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="الأسم"
            type="text"
            value={formData.fullName}
            onChange={(e: { target: { value: string; }; }) => handleChange('fullName', e.target.value)}
            required
            autoComplete="name"
            aria-required="true"
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={(e: { target: { value: string; }; }) => handleChange('email', e.target.value)}
            required
            autoComplete="email"
            aria-required="true"
          />

          <Input
            label="رقم الهاتف"
            type="tel"
            dir="ltr"
            inputMode="tel"
            value={formData.phone}
            onChange={(e: { target: { value: string; }; }) => handleChange('phone', e.target.value)}
            required
            autoComplete="tel"
            aria-required="true"
          />

          <Input
            label="كلمة المرور"
            type="password"
            dir="ltr"
            value={formData.password}
            onChange={(e: { target: { value: string; }; }) => handleChange('password', e.target.value)}
            required
            autoComplete="new-password"
            aria-required="true"
            minLength={8}
          />

          <Button type="submit" loading={loading} aria-busy={loading} disabled={loading}>
            إنشاء الحساب
          </Button>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>لديك حساب؟</span>
          <Link href="/signin" className={styles.footerLink}>تسجيل الدخول</Link>
        </footer>
      </main>
    </div>
  );
};

export default SignupPage;
