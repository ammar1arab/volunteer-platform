"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { redirectByRole } from "@/presentation/constants";

export interface SigninFormData {
  email:    string;
  password: string;
}

type FieldErrors = Partial<SigninFormData>;

const validate = (field: keyof SigninFormData, value: string): string => {
  if (field === "email") {
    if (!value.trim()) return "البريد الإلكتروني مطلوب";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "صيغة البريد غير صحيحة";
  }
  if (field === "password" && !value) return "كلمة المرور مطلوبة";
  return "";
};

export const useSignin = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [formData,    setFormData]    = useState<SigninFormData>({
    email:    decodeURIComponent(searchParams.get("email") ?? ""),
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  const handleChange = (field: keyof SigninFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleBlur = (field: keyof SigninFormData) => {
    setFieldErrors(prev => ({ ...prev, [field]: validate(field, formData[field]) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = Object.fromEntries(
      (Object.keys(formData) as (keyof SigninFormData)[])
        .map(f  => [f, validate(f, formData[f])])
        .filter(([, v]) => v)
    ) as FieldErrors;

    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setLoading(true);
    try {
      const res = await signIn("credentials", { ...formData, redirect: false });

      if (res?.error) {
        const check = await fetch("/api/auth/check-verified", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: formData.email }),
        });
        const data = await check.json();

        if (data.needsVerification) {
          // Fix #1: password in sessionStorage, never in URL
          sessionStorage.setItem("_vp", formData.password);
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&flow=signin`);
          return;
        }

        setError(data.message ?? "بريد إلكتروني أو كلمة مرور غير صحيحة");
        return;
      }

      const session = await getSession();
      window.location.href = redirectByRole(session?.user?.role);
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Signin network error"));
      setError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return { formData, fieldErrors, error, loading, handleChange, handleBlur, handleSubmit };
};