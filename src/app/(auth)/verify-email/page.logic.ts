"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { OtpType } from "@prisma/client";
import { authApi } from "@/presentation/services";
import { redirectByRole } from "@/presentation/constants";

const NETWORK_ERROR = "لا يوجد اتصال بالإنترنت، يرجى التحقق من اتصالك والمحاولة مجدداً";

export const useVerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const password = decodeURIComponent(searchParams.get("password") ?? "");

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) router.replace("/signin");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    const full = code.join("");
    if (full.length !== 6) return;
    submitCode(full);
  }, [code]);

  const submitCode = async (codeStr: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await authApi.verifyOtp({
        email,
        code: codeStr,
        type: OtpType.EMAIL_VERIFY
      });

      if (!result.success) {
        setError(result.error?.message ?? "الرمز غير صحيح أو منتهي الصلاحية");
        setCode(Array(6).fill(""));
        return;
      }

      if (password) {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.ok) {
          const session = await getSession();
          window.location.href = redirectByRole(session?.user?.role);
          return;
        }
      }

      router.replace(`/signin?email=${encodeURIComponent(email)}`);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const full = code.join("");
    if (full.length < 6) {
      setError("يرجى إدخال جميع أرقام الرمز");
      return;
    }
    submitCode(full);
  };

  const handleResend = useCallback(async () => {
    setIsResending(true);
    setError("");
    setCode(Array(6).fill(""));
    try {
      const result = await authApi.sendOtp({ email, type: OtpType.EMAIL_VERIFY });
      if (result.success) {
        setCooldown(result.data?.cooldownSeconds ?? 60);
      } else {
        setError(result.error?.message ?? "حدث خطأ أثناء إعادة إرسال الرمز");
      }
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return { code, setCode, error, loading, cooldown, handleSubmit, handleResend, email, isResending };
};
