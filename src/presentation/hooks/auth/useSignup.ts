"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib";
import type { SignupFormData } from "@/lib";

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
    email: "",
    password: "",
    fullName: "",
    phone: "",
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
    setLoading(true);

    try {
      const result = await authApi.signUp(formData);

      if (result.success) {
        router.replace("/signin?signup=success");
        return;
      }

      setError(result.error || "حدث خطأ أثناء إنشاء الحساب");
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
};
