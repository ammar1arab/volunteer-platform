"use client";
import { Suspense } from "react";
import styles from "./page.module.scss";
import { useSignin } from "./page.logic";
import Link from "next/link";
import { Input, Button, PasswordField } from "@/presentation/components";

const SigninContent = () => {
  const { formData, fieldErrors, error, loading, handleChange, handleBlur, handleSubmit } = useSignin();

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>تسجيل الدخول</h1>
          <p className={styles.subtitle}>مرحباً بعودتك</p>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <Input
              label="البريد الإلكتروني"
              type="email" dir="ltr" autoComplete="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <PasswordField
              label="كلمة المرور"
              value={formData.password}
              onChange={e => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              autoComplete="current-password"
            />
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <Button type="submit" loading={loading} disabled={loading}>
            تسجيل الدخول
          </Button>

          <div className={styles.forgotRow}>
            <Link href="/forgot-password" className={styles.forgotLink}>
              نسيت كلمة المرور؟
            </Link>
          </div>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>ليس لديك حساب؟</span>
          <Link href="/signup" className={styles.footerLink}>إنشاء حساب</Link>
        </footer>
      </main>
    </div>
  );
};

const SigninPage = () => (
  <Suspense>
    <SigninContent />
  </Suspense>
);

export default SigninPage;