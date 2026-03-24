import { useState, useCallback } from 'react';

export interface ContactForm {
  name:    string;
  email:   string;
  message: string;
}

export interface ContactErrors {
  name?:    string;
  email?:   string;
  message?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const EMPTY: ContactForm = { name: '', email: '', message: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: ContactForm): ContactErrors {
  const errors: ContactErrors = {};
  if (!form.name.trim())
    errors.name = 'الاسم مطلوب';
  else if (form.name.trim().length < 3)
    errors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';

  if (!form.email.trim())
    errors.email = 'البريد الإلكتروني مطلوب';
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = 'البريد الإلكتروني غير صحيح';

  if (!form.message.trim())
    errors.message = 'الرسالة مطلوبة';
  else if (form.message.trim().length < 10)
    errors.message = 'الرسالة يجب أن تكون 10 أحرف على الأقل';

  return errors;
}

export function useContactLogic() {
  const [form,      setForm]      = useState<ContactForm>(EMPTY);
  const [errors,    setErrors]    = useState<ContactErrors>({});
  const [touched,   setTouched]   = useState<Partial<Record<keyof ContactForm, boolean>>>({});
  const [status,    setStatus]    = useState<Status>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as keyof ContactForm]) {
      setErrors(validate(updated));
    }
  }, [form, touched]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('loading');
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'حدث خطأ ما');
        setStatus('error');
        return;
      }
      setStatus('success');
      setForm(EMPTY);
      setTouched({});
      setErrors({});
    } catch {
      setErrorMsg('تعذّر الاتصال بالخادم');
      setStatus('error');
    }
  }, [form]);

  const resetStatus = useCallback(() => setStatus('idle'), []);

  const isValid = Object.keys(validate(form)).length === 0;

  return { form, errors, touched, status, errorMsg, isValid, handleChange, handleBlur, handleSubmit, resetStatus };
}