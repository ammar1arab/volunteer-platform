"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { OtpType } from "@prisma/client";

import { authApi } from "@/presentation/services";
import { useOtpTimer } from "@/presentation/hooks";
import { redirectByRole } from "@/presentation/constants";

const NETWORK_ERROR = "لا يوجد اتصال بالإنترنت، يرجى التحقق من اتصالك والمحاولة مجدداً";

export const useVerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const { cooldown, total, start } = useOtpTimer();

  useEffect(() => {
    if (!email) router.replace("/signin");
  }, [email, router]);

  useEffect(() => {
    const full = code.join("");
    if (full.length !== 6) return;
    submitCode(full);
  }, [code]);

  const doRedirect = async (password: string) => {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) {
      const session = await getSession();
      window.location.href = redirectByRole(session?.user?.role);
      return;
    }
    router.replace(`/signin?email=${encodeURIComponent(email)}`);
  };

  const submitCode = async (codeStr: string) => {
    setError("");
    setLoading(true);
    try {
      const flow = searchParams.get("flow");

      if (flow === "signup") {
        const password = sessionStorage.getItem("_vp") ?? "";

        const result = await authApi.verifyOtp({
          email,
          code: codeStr,
          type: OtpType.EMAIL_VERIFY
        });

        if (!result.success) {
          setError(result.error?.message ?? "الرمز غير صحيح");
          setCode(Array(6).fill(""));
          return;
        }

        sessionStorage.removeItem("_vp");
        sessionStorage.removeItem("_pd");
        setShowSuccess(true);
        setTimeout(() => doRedirect(password), 1500);
        return;
      }

      const result = await authApi.verifyOtp({ email, code: codeStr, type: OtpType.EMAIL_VERIFY });

      if (!result.success) {
        setError(result.error?.message ?? "الرمز غير صحيح أو منتهي الصلاحية");
        setCode(Array(6).fill(""));
        return;
      }

      const password = sessionStorage.getItem("_vp") ?? "";
      sessionStorage.removeItem("_vp");

      setShowSuccess(true);
      setTimeout(() => {
        if (password) doRedirect(password);
        else router.replace(`/signin?email=${encodeURIComponent(email)}`);
      }, 1500);
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
        start(result.data?.cooldownSeconds ?? 60);
        setResendSent(true);
        setTimeout(() => setResendSent(false), 2000);
      } else {
        setError(result.error?.message ?? "حدث خطأ أثناء إعادة إرسال الرمز");
      }
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setIsResending(false);
    }
  }, [email, start]);

  return {
    code,
    setCode,
    error,
    loading,
    cooldown,
    total,
    showSuccess,
    resendSent,
    handleSubmit,
    handleResend,
    email,
    isResending
  };
};
