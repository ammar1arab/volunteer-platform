"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { OtpType } from "@/core/domain/enums";

import { authApi, volunteerProfileApi } from "@/presentation/services";
import { useOtpTimer } from "@/presentation/hooks";
import { redirectByRole } from "@/presentation/constants";
import { signupDraft } from "../signupDraft";

const NETWORK_ERROR = "لا يوجد اتصال بالإنترنت، يرجى التحقق من اتصالك والمحاولة مجدداً";
const PICTURE_UPLOAD_WARNING = "تم إنشاء الحساب، لكن تعذّر رفع الصورة الشخصية. يمكنك رفعها لاحقاً من الملف الشخصي.";

export const useVerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { update: updateSession } = useSession();

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const verifyingRef = useRef(false);

  const { cooldown, total, start } = useOtpTimer();

  useEffect(() => {
    if (!email) window.location.replace("/signin");
  }, [email]);

  const uploadPendingPicture = async (): Promise<boolean> => {
    const profileFile = signupDraft.getProfileFile();
    if (!profileFile) return true;

    try {
      const upload = await volunteerProfileApi.uploadPicture(profileFile);
      if (upload.success && upload.data?.imageUrl) {
        await updateSession({ profilePictureUrl: upload.data.imageUrl });
        return true;
      }
      Sentry.captureMessage("Signup picture upload unsuccessful", { level: "warning" });
      return false;
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Signup picture upload failed"));
      return false;
    } finally {
      signupDraft.clear();
    }
  };

  const doRedirect = async (password: string) => {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) {
      const uploaded = await uploadPendingPicture();
      signupDraft.clear();
      if (!uploaded) {
        setShowSuccess(false);
        setWarning(PICTURE_UPLOAD_WARNING);
        await new Promise((r) => setTimeout(r, 2200));
      }
      const session = await getSession();
      window.location.href = redirectByRole(session?.user?.role);
      return;
    }
    signupDraft.clear();
    router.replace(`/signin?email=${encodeURIComponent(email)}`);
  };

  const submitCode = async (codeStr: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setError("");
    setWarning("");
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
        else {
          signupDraft.clear();
          router.replace(`/signin?email=${encodeURIComponent(email)}`);
        }
      }, 1500);
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error("Verify email network error"));
      setError(NETWORK_ERROR);
    } finally {
      verifyingRef.current = false;
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
    warning,
    loading,
    cooldown,
    total,
    showSuccess,
    resendSent,
    handleSubmit,
    handleResend,
    email,
    isResending,
    handleOtpComplete: submitCode
  };
};
