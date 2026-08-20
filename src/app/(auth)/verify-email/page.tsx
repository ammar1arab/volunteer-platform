"use client";
import { Suspense } from "react";
import styles from "./page.module.scss";
import { useVerifyEmail } from "./page.logic";
import Link from "next/link";
import { OtpInput, Button, OtpSuccessOverlay, OtpCircularTimer } from "@/presentation/components";


const VerifyEmailContent = () => {
  const {
    code, setCode, error, warning, loading,
    cooldown, total,
    showSuccess, resendSent,
    handleSubmit, handleResend, email, isResending, handleOtpComplete,
  } = useVerifyEmail();

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        {showSuccess && <OtpSuccessOverlay />}

        <header className={styles.header}>
          <h1 className={styles.title}>تأكيد البريد الإلكتروني</h1>
          <p className={styles.subtitle}>
            أرسلنا رمز التحقق إلى
            <span className={styles.email}>{email}</span>
          </p>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}
        {warning && <div className={styles.warning} role="status">{warning}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <OtpInput value={code} onChange={setCode} onComplete={handleOtpComplete} disabled={loading} />
          <Button type="submit" loading={loading} disabled={loading || code.join("").length < 6} style={{ alignSelf: "center" }}>
            {loading ? "جارٍ التحقق..." : "تفعيل الحساب"}
          </Button>
        </form>

        <div className={styles.resend}>
          {resendSent ? (
            <p className={styles.resendSuccess}>تم الإرسال ✓</p>
          ) : cooldown > 0 ? (
            <div className={styles.timerRow}>
              <OtpCircularTimer seconds={cooldown} total={total} />
              <span className={styles.timerLabel}>إعادة الإرسال بعد {cooldown}ث</span>
            </div>
          ) : (
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "جارٍ الإرسال..." : "إعادة إرسال الرمز"}
            </button>
          )}
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

const VerifyEmailPage = () => (
  <Suspense>
    <VerifyEmailContent />
  </Suspense>
);

export default VerifyEmailPage;