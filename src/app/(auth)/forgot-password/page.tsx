"use client";
import styles from "./page.module.scss";
import { useForgotPassword } from "./page.logic";
import { Input, Button, OtpInput } from "@/presentation/components";
import Link from "next/link";

const CRITERIA = [
  { test: (p: string) => p.length >= 6, label: "6 أحرف على الأقل" },
];

const ForgotPasswordPage = () => {
  const {
    step, email, setEmail, emailError,
    code, setCode,
    newPassword, handlePasswordChange,
    confirmPassword, handleConfirmChange,
    passwordError, confirmError,
    error, loading, cooldown, isResending,
    handleSendOtp, handleVerifyOtp, handleResetPassword, handleResend,
  } = useForgotPassword();

  return (
    <div className={styles.page}>
      <main className={styles.card}>

        {step === "email" && (
          <div className={styles.stepContent}>
            <header className={styles.header}>
              <h1 className={styles.title}>نسيت كلمة المرور؟</h1>
              <p className={styles.subtitle}>أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
            </header>

            {error && <div className={styles.error} role="alert">{error}</div>}

            <form onSubmit={handleSendOtp} noValidate>
              <div className={styles.field}>
                <Input
                  label="البريد الإلكتروني" type="email" dir="ltr"
                  autoComplete="email" autoFocus
                  value={email}
                  onChange={e => { setEmail(e.target.value); }}
                />
                {emailError && <span className={styles.fieldError}>{emailError}</span>}
              </div>
              <Button type="submit" loading={loading} disabled={loading}>
                إرسال رمز التحقق
              </Button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className={styles.stepContent}>
            <header className={styles.header}>
              <h1 className={styles.title}>أدخل رمز التحقق</h1>
              <p className={styles.subtitle}>
                أرسلنا رمزاً إلى
                <span className={styles.email}>{email}</span>
              </p>
            </header>

            {error && <div className={styles.error} role="alert">{error}</div>}

            <form onSubmit={handleVerifyOtp} noValidate>
              <OtpInput value={code} onChange={setCode} disabled={loading} />
              <Button type="submit" loading={loading} disabled={loading || code.join("").length < 6}>
                {loading ? "جارٍ التحقق..." : "تحقق"}
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
          </div>
        )}

        {step === "password" && (
          <div className={styles.stepContent} key="password">
            <header className={styles.header}>
              <h1 className={styles.title}>كلمة مرور جديدة</h1>
              <p className={styles.subtitle}>أنشئ كلمة مرور جديدة لحسابك</p>
            </header>

            {error && <div className={styles.error} role="alert">{error}</div>}

            <form onSubmit={handleResetPassword} noValidate>
              <div className={styles.field}>
                <Input
                  label="كلمة المرور الجديدة" type="password" dir="ltr"
                  autoComplete="new-password" autoFocus
                  value={newPassword}
                  onChange={e => handlePasswordChange(e.target.value)}
                />
                {passwordError && <span className={styles.fieldError}>{passwordError}</span>}
              </div>
              <div className={styles.field}>
                <Input
                  label="تأكيد كلمة المرور" type="password" dir="ltr"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => handleConfirmChange(e.target.value)}
                />
                {confirmError && <span className={styles.fieldError}>{confirmError}</span>}
              </div>
              <Button type="submit" loading={loading} disabled={loading || !newPassword || !confirmPassword}>
                تغيير كلمة المرور
              </Button>
            </form>
          </div>
        )}

        <div className={styles.support}>
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

export default ForgotPasswordPage;