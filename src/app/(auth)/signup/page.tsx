"use client";
import styles from "./page.module.scss";
import { useSignup } from "./page.logic";
import Link from "next/link";
import { Input, Button, SelectInput, BirthDateInput } from "@/presentation/components";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";
import { ChevronRight } from "lucide-react";

const STEPS = ["البيانات الأساسية", "معلومات إضافية", "كلمة المرور"];

const SignupPage = () => {
  const {
    step, formData, fieldErrors, error, loading,
    emailChecking, handleChange, handleBlur,
    handleSelectChange, nextStep, prevStep, handleSubmit,
  } = useSignup();

  const F = (f: string) => fieldErrors[f as keyof typeof fieldErrors];
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className={styles.page}>
      <main className={styles.card}>

        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.steps}>
            {STEPS.map((label, i) => {
              const s       = i + 1;
              const done    = s < step;
              const current = s === step;
              return (
                <div key={i} className={`${styles.step} ${current ? styles.current : ""} ${done ? styles.done : ""}`}>
                  <div className={styles.dot}>{done ? "✓" : s}</div>
                  <span className={styles.stepLabel}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form
          onSubmit={step === 3 ? handleSubmit : e => { e.preventDefault(); nextStep(); }}
          noValidate
        >
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.field}>
                <Input
                  label="الاسم الكامل" type="text" autoComplete="name" autoFocus
                  value={formData.fullName}
                  onChange={e => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                />
                {F("fullName") && <span className={styles.fieldError}>{F("fullName")}</span>}
              </div>
              <div className={styles.field}>
                <Input
                  label="البريد الإلكتروني" type="email" dir="ltr" autoComplete="email"
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {F("email") && <span className={styles.fieldError}>{F("email")}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.field}>
                <Input
                  label="رقم الهاتف" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" autoFocus
                  value={formData.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                />
                {F("phone") && <span className={styles.fieldError}>{F("phone")}</span>}
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <SelectInput
                    label="المدينة" placeholder="المدينة"
                    value={formData.city} options={CITY_OPTIONS}
                    onChange={v => handleSelectChange("city", v)}
                  />
                  {F("city") && <span className={styles.fieldError}>{F("city")}</span>}
                </div>
                <div className={styles.field}>
                  <SelectInput
                    label="الجنس" placeholder="الجنس"
                    value={formData.gender} options={GENDER_OPTIONS}
                    onChange={v => handleSelectChange("gender", v)}
                  />
                  {F("gender") && <span className={styles.fieldError}>{F("gender")}</span>}
                </div>
              </div>
              <div className={styles.field}>
                <BirthDateInput
                  label="تاريخ الميلاد" minAge={10}
                  value={formData.dateOfBirth}
                  onChange={v => handleSelectChange("dateOfBirth", v)}
                  error={F("dateOfBirth")}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.field}>
                <Input
                  label="كلمة المرور" type="password" dir="ltr" autoComplete="new-password" autoFocus
                  value={formData.password}
                  onChange={e => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                />
                {F("password") && <span className={styles.fieldError}>{F("password")}</span>}
              </div>
              <div className={styles.field}>
                <Input
                  label="تأكيد كلمة المرور" type="password" dir="ltr" autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                />
                {F("confirmPassword") && <span className={styles.fieldError}>{F("confirmPassword")}</span>}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {step > 1 && (
              <button type="button" className={styles.backBtn} onClick={prevStep}>
                <ChevronRight size={15} /> رجوع
              </button>
            )}
            <Button
              type="submit"
              loading={loading || (step === 1 && emailChecking)}
              disabled={loading || (step === 1 && emailChecking)}
            >
              {step === 1 && emailChecking
                ? "جارٍ التحقق..."
                : step === 3
                ? "إنشاء الحساب"
                : "التالي"}
            </Button>
          </div>
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