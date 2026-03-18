"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Gender, JordanianCity } from "@/core/domain/enums";
import { authApi } from "@/presentation/services";

export type SignupStep = 1 | 2 | 3;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const STEP_FIELDS: Record<SignupStep, (keyof FormData)[]> = {
  1: ["fullName", "email"],
  2: ["phone", "city", "gender", "dateOfBirth"],
  3: ["password", "confirmPassword"]
};

const validateField = (field: keyof FormData, value: string, all: FormData): string => {
  switch (field) {
    case "fullName":
      if (!value.trim()) return "الاسم الكامل مطلوب";
      if (value.trim().length < 2) return "الاسم قصير جداً";
      if (value.trim().length > 35) return "الاسم طويل جداً";
      return "";
    case "email":
      if (!value.trim()) return "البريد الإلكتروني مطلوب";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "صيغة البريد غير صحيحة";
      return "";
    case "phone":
      if (!value.trim()) return "رقم الهاتف مطلوب";
      if (value.replace(/\s/g, "").length < 10) return "يجب أن يكون 10 أرقام على الأقل";
      return "";
    case "city":
      return value ? "" : "يرجى اختيار المدينة";
    case "gender":
      return value ? "" : "يرجى تحديد الجنس";
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

export const useSignup = () => {
  const router = useRouter();
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    gender: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    return () => {
      if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
    };
  }, []);

  const checkEmail = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailChecking(true);
    setEmailVerified(false);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setEmailTaken(data.taken);
      setEmailVerified(!data.taken);
      if (data.taken) setFieldErrors((prev) => ({ ...prev, email: "البريد الإلكتروني مستخدم بالفعل" }));
    } catch {
      setEmailVerified(false);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "email") {
      setEmailTaken(false);
      setEmailVerified(false);
      if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
      emailCheckTimer.current = setTimeout(() => checkEmail(value), 300);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const msg = validateField(field, formData[field], formData);
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));

    if (field === "email" && !msg && formData.email && !emailTaken && !emailChecking) {
      if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
      checkEmail(formData.email);
    }
  };

  const validateStep = (s: SignupStep): boolean => {
    const errors: FieldErrors = {};
    STEP_FIELDS[s].forEach((f) => {
      const msg = validateField(f, formData[f], formData);
      if (msg) errors[f] = msg;
    });
    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return !Object.keys(errors).length;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step === 1 && (emailTaken || emailChecking || !emailVerified)) return;
    setStep((p) => (p < 3 ? ((p + 1) as SignupStep) : p));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    handleChange(field, value);
    const msg = validateField(field, value, { ...formData, [field]: value });
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const prevStep = () => {
    setError("");
    setStep((p) => (p > 1 ? ((p - 1) as SignupStep) : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailTaken || !validateStep(3)) return;
    setLoading(true);
    try {
      const result = await authApi.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city as JordanianCity,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender as Gender
      });

      if (result.success) {
        router.replace(
          `/verify-email?email=${encodeURIComponent(formData.email)}&flow=signup&password=${encodeURIComponent(formData.password)}`
        );
        return;
      }
      setError(result.error?.message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    } catch {
      setError("تعذّر الاتصال بالخادم، يرجى التحقق من اتصالك");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    formData,
    fieldErrors,
    error,
    loading,
    emailChecking,
    handleChange,
    handleBlur,
    nextStep,
    handleSelectChange,
    prevStep,
    handleSubmit
  };
};
