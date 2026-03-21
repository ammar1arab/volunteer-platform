"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Gender, JordanianCity } from "@/core/domain/enums";
import { authApi } from "@/presentation/services";

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
      if (value.replace(/\s/g, "").length < 10) return "10 أرقام على الأقل";
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
  city: "",
  gender: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

export const useSignup = () => {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const checkEmail = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailStatus("checking");
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

      // FIX: re-validate confirmPassword live the moment password changes
      if (field === "password" && prev.confirmPassword) {
        const msg = validate("confirmPassword", prev.confirmPassword, next);
        setErrors((p) => ({ ...p, confirmPassword: msg }));
      }

      // FIX: selects have no blur event — validate immediately on change
      if (field === "city" || field === "gender") {
        const msg = validate(field, value, next);
        setErrors((p) => ({ ...p, [field]: msg }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // FIX: re-surface the error instead of silently returning
    if (emailStatus === "taken") {
      setErrors((p) => ({ ...p, email: "البريد مستخدم مسبقاً" }));
      return;
    }
    if (emailStatus === "checking") return;

    const allErrors: FieldErrors = {};
    (Object.keys(EMPTY) as (keyof FormData)[]).forEach((f) => {
      const msg = validate(f, form[f], form);
      if (msg) allErrors[f] = msg;
    });

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
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
      });

      if (res.success) {
        // SECURITY FIX: never put passwords in the URL (browser history / server logs).
        // sessionStorage is scoped to the tab and cleared when it closes.
        sessionStorage.setItem("_vp", form.password);
        router.replace(
          `/verify-email?email=${encodeURIComponent(form.email)}&flow=signup`
        );
        return;
      }
      setServerError(res.error?.message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    } catch {
      setServerError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    serverError,
    loading,
    emailStatus,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};