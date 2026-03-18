"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OtpType } from "@prisma/client";
import { authApi } from "@/presentation/services";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

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
      const result = await authApi.checkOtp({ email, code: codeStr, type: OtpType.FORGOT_PASSWORD });
      if (!result.success) {
        setError(result.error?.message ?? "الرمز غير صحيح أو منتهي الصلاحية");
        setCode(Array(6).fill(""));
        return;
      }
      setStep("password");
      setError("");
    } catch {
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
      const result = await authApi.forgotPassword({ email });
      if (!result.success) {
        const msg = result.error?.message ?? "حدث خطأ أثناء إرسال الرمز";
        const errCode = result.error?.code;
        if (errCode === "NOT_FOUND" || errCode === "FORBIDDEN" || errCode === "VALIDATION_ERROR") {
          setEmailError(msg);
        } else {
          setError(msg);
        }
        return;
      }
      setCooldown(result.data?.cooldownSeconds ?? 60);
      setStep("otp");
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const full = code.join("");
    if (full.length < 6) {
      setError("يرجى إدخال جميع أرقام الرمز");
      return;
    }
    verifyCode(full);
  };

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
    setLoading(true);
    try {
      const result = await authApi.resetPassword({ email, code: code.join(""), newPassword });
      if (!result.success) {
        setError(result.error?.message ?? "حدث خطأ أثناء تغيير كلمة المرور");
        return;
      }
      router.replace("/signin?reset=success");
    } catch {
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
    isResending,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResend
  };
};
