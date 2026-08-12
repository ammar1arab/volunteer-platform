"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { Gender, JordanianCity } from "@/core/domain/enums";
import { authApi } from "@/presentation/services";
import { signupDraft } from "../signupDraft";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  dateOfBirth: string;
  city: string;
  gender: string;
  educationLevel: string;
  occupation: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const STEP1_FIELDS: (keyof FormData)[] = ["fullName", "email", "phone", "dateOfBirth"];
const STEP2_FIELDS: (keyof FormData)[] = ["city", "gender", "password", "confirmPassword"];

const validate = (field: keyof FormData, value: string, all: FormData): string => {
  switch (field) {
    case "fullName":
      if (!value.trim()) return "الاسم مطلوب";
      if (value.trim().length < 2) return "الاسم قصير جداً";
      if (value.trim().length > 35) return "الاسم طويل جداً";
      return "";
    case "email":
      if (!value.trim()) return "البريد الإلكتروني مطلوب";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "صيغة غير صحيحة";
      return "";
    case "phone":
      if (!value.trim()) return "رقم الهاتف مطلوب";
      return "";
    case "membershipNumber":
    case "educationLevel":
    case "occupation":
      return "";
    case "city":
      return value ? "" : "اختر المدينة";
    case "gender":
      return value ? "" : "اختر الجنس";
    case "dateOfBirth": {
      if (!value) return "تاريخ الميلاد مطلوب";
      const age = (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 10) return "يجب أن يكون عمرك 10 سنوات على الأقل";
      return "";
    }
    case "password":
      if (!value) return "كلمة المرور مطلوبة";
      if (value.length < 6) return "6 أحرف على الأقل";
      return "";
    case "confirmPassword":
      if (!value) return "تأكيد كلمة المرور مطلوب";
      if (value !== all.password) return "كلمات المرور غير متطابقة";
      return "";
    default:
      return "";
  }
};

const EMPTY: FormData = {
  fullName: "",
  email: "",
  phone: "",
  membershipNumber: "",
  dateOfBirth: "",
  city: "",
  gender: "",
  educationLevel: "",
  occupation: "",
  password: "",
  confirmPassword: ""
};

export const useSignup = () => {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    },
    [profilePreview]
  );

  const checkEmail = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailStatus("checking");
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setEmailStatus(data.taken ? "taken" : "ok");
      if (data.taken) setErrors((p) => ({ ...p, email: "البريد مستخدم مسبقاً" }));
    } catch {
      setEmailStatus("idle");
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "password" && prev.confirmPassword) {
        const msg = validate("confirmPassword", prev.confirmPassword, next);
        setErrors((p) => ({ ...p, confirmPassword: msg }));
      }
      if (field === "city" || field === "gender") {
        setErrors((p) => ({ ...p, [field]: validate(field, value, next) }));
      }
      return next;
    });
    setServerError("");
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (field === "email") {
      setEmailStatus("idle");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => checkEmail(value), 400);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const msg = validate(field, form[field], form);
    setErrors((p) => ({ ...p, [field]: msg }));
    if (field === "email" && !msg) checkEmail(form.email);
  };

  const handleProfileFileChange = (file: File | null) => {
    if (profilePreview) URL.revokeObjectURL(profilePreview);
    setProfileFile(file);
    setProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleNext = () => {
    if (emailStatus === "taken") {
      setErrors((p) => ({ ...p, email: "البريد مستخدم مسبقاً" }));
      return;
    }
    if (emailStatus === "checking") return;

    const stepErrors: FieldErrors = {};
    STEP1_FIELDS.forEach((f) => {
      const msg = validate(f, form[f], form);
      if (msg) stepErrors[f] = msg;
    });
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stepErrors: FieldErrors = {};
    STEP2_FIELDS.forEach((f) => {
      const msg = validate(f, form[f], form);
      if (msg) stepErrors[f] = msg;
    });
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        city: form.city as JordanianCity,
        dateOfBirth: new Date(form.dateOfBirth),
        gender: form.gender as Gender,
        membershipNumber: form.membershipNumber.trim() || undefined,
        educationLevel: form.educationLevel || undefined,
        occupation: form.occupation.trim() || undefined
      });

      if (res.success) {
        sessionStorage.setItem("_vp", form.password);
        sessionStorage.setItem(
          "_pd",
          JSON.stringify({
            fullName: form.fullName,
            phone: form.phone,
            city: form.city,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            membershipNumber: form.membershipNumber.trim() || undefined
          })
        );
        signupDraft.setProfileFile(profileFile);
        router.replace(`/verify-email?email=${encodeURIComponent(form.email)}&flow=signup`);
        return;
      }
      setServerError(res.error?.message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Signup network error"));
      setServerError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    form,
    errors,
    serverError,
    loading,
    emailStatus,
    profilePreview,
    handleChange,
    handleBlur,
    handleProfileFileChange,
    handleNext,
    handleBack,
    handleSubmit
  };
};
