"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { OtpType } from "@prisma/client";
import { authApi } from "@/presentation/services";
import { useOtpTimer } from "@/presentation/hooks";

type Step = "email" | "otp" | "password";

const validatePassword = (p: string): string => {
  if (!p) return "كلمة المرور مطلوبة";
  if (p.length < 6) return "6 أحرف على الأقل";
  return "";
};

const NETWORK_ERROR = "لا يوجد اتصال بالإنترنت، يرجى التحقق من اتصالك والمحاولة مجدداً";

export const useForgotPassword = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Use the timer hook
  const { cooldown, total, start } = useOtpTimer();

  // Auto-verify when all 6 digits filled
  useEffect(() => {
    if (step !== "otp") return;
    const full = code.join("");
    if (full.length !== 6) return;
    verifyCode(full);
  }, [code, step]);

  const verifyCode = async (codeStr: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await authApi.verifyOtp({
        email,
        code: codeStr,
        type: OtpType.FORGOT_PASSWORD
      });

      if (!result.success) {
        setError(result.error?.message ?? "الرمز غير صحيح أو منتهي الصلاحية");
        setCode(Array(6).fill(""));
        return;
      }

      const token = (result as any).data?.resetToken ?? "";
      if (!token) {
        setError("حدث خطأ في إصدار رمز إعادة التعيين");
        return;
      }
      setResetToken(token);
      setStep("password");
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Verify OTP network error"));
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (val: string) => {
    setNewPassword(val);
    setPasswordError(validatePassword(val));
    if (confirmPassword) setConfirmError(val !== confirmPassword ? "كلمات المرور غير متطابقة" : "");
  };

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val);
    setConfirmError(val !== newPassword ? "كلمات المرور غير متطابقة" : "");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const full = code.join("");
    if (full.length < 6) {
      setError("يرجى إدخال جميع أرقام الرمز");
      return;
    }
    verifyCode(full);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("البريد الإلكتروني مطلوب");
      return;
    }
    setEmailError("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const check = await res.json();
      if (!check.taken) {
        setEmailError("البريد الإلكتروني غير مسجل");
        return;
      }
      const result = await authApi.forgotPassword({ email });
      if (result.success) {
        start(result.data?.cooldownSeconds ?? 60);
        setStep("otp");
      } else {
        setError(result.error?.message ?? "فشل إرسال الرمز");
      }
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Send OTP network error"));
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setIsResending(true);
    setError("");
    setCode(Array(6).fill(""));
    try {
      const result = await authApi.forgotPassword({ email });
      if (result.success) {
        start(result.data?.cooldownSeconds ?? 60);
        setResendSent(true);
        setTimeout(() => setResendSent(false), 2000);
      }
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Resend OTP network error"));
      setError(NETWORK_ERROR);
    } finally {
      setIsResending(false);
    }
  }, [email, start]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("كلمات المرور غير متطابقة");
      return;
    }
    if (!resetToken) {
      setError("انتهت صلاحية الجلسة، يرجى البدء من جديد");
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.resetPassword({ resetToken, newPassword });
      if (!result.success) {
        setError(result.error?.message ?? "حدث خطأ");
        return;
      }
      setShowSuccess(true);
      setTimeout(() => router.replace("/signin?reset=success"), 1500);
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Reset password network error"));
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    email,
    setEmail,
    emailError,
    code,
    setCode,
    newPassword,
    handlePasswordChange,
    confirmPassword,
    handleConfirmChange,
    passwordError,
    confirmError,
    error,
    loading,
    cooldown,
    total, 
    isResending,
    resendSent,
    showSuccess, 
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResend
  };
};
