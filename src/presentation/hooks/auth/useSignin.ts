"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { SigninFormData } from "@/lib/types/auth.types";

interface UseSigninReturn {
  formData: SigninFormData;
  error: string;
  loading: boolean;
  handleChange: (field: keyof SigninFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useSignin = (): UseSigninReturn => {
  const router = useRouter();
  const [formData, setFormData] = useState<SigninFormData>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof SigninFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("بريد إلكتروني أو كلمة مرور غير صحيحة");
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      router.refresh();
      router.replace(role === "ADMIN" ? "/admin/dashboard" : "/volunteer/profile");
    } catch {
      setError("حدث خطأ في الاتصال");
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
};
