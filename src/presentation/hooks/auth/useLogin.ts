import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import type { LoginFormData } from '@/lib/types';

interface UseLoginReturn {
  formData: LoginFormData;
  error: string;
  loading: boolean;
  handleChange: (field: keyof LoginFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('بريد إلكتروني أو كلمة مرور غير صحيحة');
        setLoading(false);
        return;
      }

      // ✅ بعد نجاح تسجيل الدخول، next-auth بتحفظ الـ session تلقائياً
      // ✅ نستخدم callback URL من next-auth مباشرة
      if (result?.ok) {
        // الـ session هتكون محدثة، ممكن نوجه للصفحة المناسبة
        // أو نستخدم callbackUrl من next-auth
        router.push('/volunteer/profile'); // أو استخدم router.refresh() بعدين redirect من middleware
        router.refresh(); // عشان تحديث الـ session
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ في الاتصال');
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
  };
};