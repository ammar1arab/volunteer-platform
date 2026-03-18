"use client";
import { Suspense } from "react";
import styles from "./page.module.scss";
import { useVerifyEmail } from "./page.logic";
import { OtpInput, Button } from "@/presentation/components";
import Link from "next/link";

const VerifyEmailContent = () => {
  const { code, setCode, error, loading, cooldown, handleSubmit, handleResend, email, isResending } = useVerifyEmail();

  return (
    <div className={styles.page}>
      <main className={styles.card}>

        <header className={styles.header}>
          <h1 className={styles.title}>تأكيد البريد الإلكتروني</h1>
          <p className={styles.subtitle}>
            أرسلنا رمز التحقق إلى
            <span className={styles.email}>{email}</span>
          </p>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <OtpInput value={code} onChange={setCode} disabled={loading} />
          <Button type="submit" loading={loading} disabled={loading || code.join("").length < 6}>
            {loading ? "جارٍ التحقق..." : "تفعيل الحساب"}
          </Button>
        </form>

        <div className={styles.resend}>
          {cooldown > 0
            ? <p className={styles.cooldown}>إعادة الإرسال بعد {cooldown} ثانية</p>
            : <button type="button" className={styles.resendBtn} onClick={handleResend} disabled={isResending}>
              {isResending ? "جارٍ الإرسال..." : "إعادة إرسال الرمز"}
            </button>
          }
        </div>

        <div className={styles.support}>
          <p>لم تستلم الرمز؟</p>
          <div className={styles.supportLinks}>
            <a href="mailto:support@youthprints.online">support@youthprints.online</a>
            <span>·</span>
            <a href="https://wa.me/962776268907" target="_blank" rel="noreferrer">واتساب</a>
          </div>
        </div>

        <footer className={styles.footer}>
          <Link href="/signin" className={styles.footerLink}>العودة لتسجيل الدخول</Link>
        </footer>
      </main>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;