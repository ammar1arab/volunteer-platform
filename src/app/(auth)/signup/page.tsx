'use client';
import styles from './page.module.scss';
import { useSignup } from './page.logic';

import Link from 'next/link';
import { Input, Button, SelectInput, BirthDateInput } from '@/presentation/components';
import { JORDANIAN_CITIES } from '@/lib';

const SignupPage = () => {
  const { formData, error, loading, handleChange, handleSubmit } = useSignup();

  return (
    <div className={styles.page}>
      <main className={styles.card} aria-labelledby="signup-title">
        <header className={styles.header}>
          <h1 id="signup-title" className={styles.title}>  انضمامك لبصمات شبابية يشرفنا</h1>
        </header>

        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="الاسم الكامل"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            required
            autoComplete="name"
            aria-required="true"
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
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
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            autoComplete="tel"
            aria-required="true"
          />

          <SelectInput
            label="المدينة"
            value={formData.city}
            options={JORDANIAN_CITIES}
            onChange={(value) => handleChange('city', value)}
            placeholder="اختر مدينتك"
            required
          />

          <BirthDateInput
            label="تاريخ الميلاد"
            value={formData.dateOfBirth}
            onChange={(value) => handleChange("dateOfBirth", value)}
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            dir="ltr"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            autoComplete="new-password"
            aria-required="true"
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            dir="ltr"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
            aria-required="true"
          />

          <Button type="submit" loading={loading} aria-busy={loading} disabled={loading}>
            إنشاء الحساب
          </Button>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>لديك حساب؟</span>
          <Link href="/signin" className={styles.footerLink}>
            تسجيل الدخول
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default SignupPage;