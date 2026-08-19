"use client";
import styles from "./page.module.scss";
import { useSignup } from "./page.logic";
import Link from "next/link";
import Image from "next/image";
import { Input, Button, SelectInput, BirthDateInput, PasswordField, PasswordStrength } from "@/presentation/components";
import { CITY_OPTIONS, GENDER_OPTIONS, EDUCATION_LEVEL_OPTIONS } from "@/presentation/constants";
import { User, Upload } from "lucide-react";

const SignupPage = () => {
  const {
    step, form, errors, serverError, loading, emailStatus, profilePreview,
    handleChange, handleBlur, handleProfileFileChange, handleNext, handleBack, handleSubmit,
  } = useSignup();

  const E = (f: string) => errors[f as keyof typeof errors];

  return (
    <div className={styles.page}>
      <main className={styles.card}>

        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ""}`} />
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ""}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ""}`} />
        </div>

        {serverError && <div className={styles.error} role="alert">{serverError}</div>}

        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.form}>
              <div className={styles.avatarField}>
                <label className={styles.avatarLabel}>
                  {profilePreview
                    ? <Image src={profilePreview} alt="صورة شخصية" width={72} height={72} className={styles.avatar} unoptimized />
                    : <div className={styles.avatarPlaceholder}><User size={28} /></div>
                  }
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => handleProfileFileChange(e.target.files?.[0] ?? null)}
                  />
                  <div className={styles.uploadBadge}><Upload size={11} /></div>
                </label>
                <span className={styles.avatarHint}>صورة شخصية (اختياري)</span>
              </div>

              <div className={styles.field}>
                <Input
                  label="الاسم الكامل"
                  value={form.fullName}
                  onChange={e => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                />
                {E("fullName") && <span className={styles.fieldError}>{E("fullName")}</span>}
              </div>

              <div className={styles.field}>
                <Input
                  label="البريد الإلكتروني"
                  type="email" dir="ltr"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {E("email") && <span className={styles.fieldError}>{E("email")}</span>}
                {!E("email") && emailStatus === "checking" && <span className={styles.hint}>جاري التحقق...</span>}
                {!E("email") && emailStatus === "ok" && <span className={`${styles.hint} ${styles.hintOk}`}>البريد متاح ✓</span>}
              </div>

              <div className={styles.field}>
                <Input
                  label="رقم الهاتف"
                  type="tel" dir="ltr"
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                />
                {E("phone") && <span className={styles.fieldError}>{E("phone")}</span>}
              </div>

              <div className={styles.field}>
                <Input
                  label="رقم الانتساب (اختياري)"
                  value={form.membershipNumber}
                  onChange={e => handleChange("membershipNumber", e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <BirthDateInput
                  label="تاريخ الميلاد" minAge={10}
                  value={form.dateOfBirth}
                  onChange={v => handleChange("dateOfBirth", v)}
                  error={E("dateOfBirth")}
                />
              </div>

              <Button
                type="button"
                loading={emailStatus === "checking"}
                disabled={loading || emailStatus === "checking" || emailStatus === "taken"}
                onClick={handleNext}
              >
                التالي
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} noValidate className={styles.stepContent}>
            <div className={styles.form}>
              <div className={styles.rowFixed}>
                <div className={styles.field}>
                  <SelectInput
                    label="المدينة" value={form.city}
                    options={CITY_OPTIONS}
                    onChange={v => handleChange("city", v)}
                  />
                  {E("city") && <span className={styles.fieldError}>{E("city")}</span>}
                </div>
                <div className={styles.field}>
                  <SelectInput
                    label="الجنس" value={form.gender}
                    options={GENDER_OPTIONS}
                    onChange={v => handleChange("gender", v)}
                  />
                  {E("gender") && <span className={styles.fieldError}>{E("gender")}</span>}
                </div>
              </div>

              <div className={styles.rowFixed}>
                <div className={styles.field}>
                  <SelectInput
                    label="المستوى التعليمي"
                    value={form.educationLevel}
                    options={[{ value: "", label: "غير محدد" }, ...EDUCATION_LEVEL_OPTIONS]}
                    onChange={v => handleChange("educationLevel", v)}
                  />
                </div>
                <div className={styles.field}>
                  <Input
                    label="التخصص / المهنة"
                    value={form.occupation}
                    onChange={e => handleChange("occupation", e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <PasswordField
                  label="كلمة المرور"
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  autoComplete="new-password"
                />
                <PasswordStrength password={form.password} />
                {E("password") && <span className={styles.fieldError}>{E("password")}</span>}
              </div>

              <div className={styles.field}>
                <PasswordField
                  label="تأكيد كلمة المرور"
                  value={form.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  autoComplete="new-password"
                />
                {E("confirmPassword") && <span className={styles.fieldError}>{E("confirmPassword")}</span>}
              </div>

              <div className={styles.row}>
                <Button type="button" variant="ghost" onClick={handleBack} disabled={loading}>
                  رجوع
                </Button>
                <Button type="submit" loading={loading} disabled={loading}>
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </Button>
              </div>
            </div>
          </form>
        )}

        <footer className={styles.footer}>
          <span className={styles.footerText}>لديك حساب؟</span>
          <Link href="/signin" className={styles.footerLink}>تسجيل الدخول</Link>
        </footer>
      </main>
    </div>
  );
};

export default SignupPage;
