import { useState } from "react";

export const usePasswordValidation = () => {
  const [password,      setPassword]      = useState("");
  const [confirm,       setConfirm]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError,  setConfirmError]  = useState("");

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordError(!val ? "كلمة المرور مطلوبة" : val.length < 6 ? "6 أحرف على الأقل" : "");
    if (confirm) setConfirmError(val !== confirm ? "كلمات المرور غير متطابقة" : "");
  };

  const handleConfirmChange = (val: string) => {
    setConfirm(val);
    setConfirmError(val !== password ? "كلمات المرور غير متطابقة" : "");
  };

  const validatePasswords = (): boolean => {
    const pe = !password ? "كلمة المرور مطلوبة" : password.length < 6 ? "6 أحرف على الأقل" : "";
    const ce = !confirm  ? "تأكيد كلمة المرور مطلوب" : confirm !== password ? "كلمات المرور غير متطابقة" : "";
    setPasswordError(pe);
    setConfirmError(ce);
    return !pe && !ce;
  };

  return {
    password, confirm,
    passwordError, confirmError,
    handlePasswordChange, handleConfirmChange,
    validatePasswords,
  };
};