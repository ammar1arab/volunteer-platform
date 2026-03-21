"use client";

import styles from "./page.module.scss";
import { useSignup } from "./page.logic";
import Link from "next/link";
import { useState } from "react";
import { Input, Button, SelectInput, BirthDateInput } from "@/presentation/components";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    className={`${styles.eyeSvg} ${visible ? styles.eyeOpen : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.eyeLid}
    />
    <circle cx="12" cy="12" r="3" className={styles.eyePupil} />
    <line
      x1="4" y1="4" x2="20" y2="20"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`${styles.eyeSlash} ${visible ? styles.eyeSlashGone : ""}`}
    />
  </svg>
);

const PasswordField = ({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.pwWrap}>
      <Input
        label={label}
        type={show ? "text" : "password"}
        dir="ltr"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        tabIndex={-1}
      >
        <span className={styles.ripple} />
        <EyeIcon visible={show} />
      </button>
    </div>
  );
};

const SignupPage = () => {
  const {
    form, errors, serverError, loading, emailStatus,
    handleChange, handleBlur, handleSubmit,
  } = useSignup();

  const E = (f: string) => errors[f as keyof typeof errors];

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        {serverError && (
          <div className={styles.error} role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          <div className={styles.field}>
            <Input
              label="الاسم الكامل"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onBlur={() => handleBlur("fullName")}
            />
            {E("fullName") && <span className={styles.fieldError}>{E("fullName")}</span>}
          </div>

          <div className={styles.field}>
            <Input
              label="البريد الإلكتروني"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {E("email") && <span className={styles.fieldError}>{E("email")}</span>}
            {!E("email") && emailStatus === "checking" && (
              <span className={styles.hint}>جاري التحقق...</span>
            )}
            {!E("email") && emailStatus === "ok" && (
              <span className={`${styles.hint} ${styles.hintOk}`}>البريد متاح ✓</span>
            )}
          </div>

          <div className={styles.field}>
            <Input
              label="رقم الهاتف"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
            />
            {E("phone") && <span className={styles.fieldError}>{E("phone")}</span>}
          </div>

          <div className={styles.field}>
            <BirthDateInput
              label="تاريخ الميلاد"
              minAge={10}
              value={form.dateOfBirth}
              onChange={(v) => handleChange("dateOfBirth", v)}
              error={E("dateOfBirth")}
            />
          </div>

          <div className={styles.rowFixed}>
            <div className={styles.field}>
              <SelectInput
                label="المدينة"
                value={form.city}
                options={CITY_OPTIONS}
                onChange={(v) => handleChange("city", v)}
              />
              {E("city") && <span className={styles.fieldError}>{E("city")}</span>}
            </div>
            <div className={styles.field}>
              <SelectInput
                label="الجنس"
                value={form.gender}
                options={GENDER_OPTIONS}
                onChange={(v) => handleChange("gender", v)}
              />
              {E("gender") && <span className={styles.fieldError}>{E("gender")}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <PasswordField
                label="كلمة المرور"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
              />
              {E("password") && <span className={styles.fieldError}>{E("password")}</span>}
            </div>
            <div className={styles.field}>
              <PasswordField
                label="تأكيد كلمة المرور"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
              />
              {E("confirmPassword") && (
                <span className={styles.fieldError}>{E("confirmPassword")}</span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            loading={loading || emailStatus === "checking"}
            disabled={loading || emailStatus === "checking" || emailStatus === "taken"}
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
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