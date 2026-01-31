"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, ROUTES } from "@/lib";

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

interface UseSignupReturn {
  formData: SignupFormData;
  error: string;
  loading: boolean;
  handleChange: (field: keyof SignupFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    if (!formData.city) {
      setError("يرجى اختيار المدينة");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("يرجى إدخال تاريخ الميلاد");
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        dateOfBirth: formData.dateOfBirth,
      });

      if (result.success) {
        router.replace(`${ROUTES.LOGIN}?signup=success`);
        return;
      }

      setError(result.error || "حدث خطأ أثناء إنشاء الحساب");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
};
