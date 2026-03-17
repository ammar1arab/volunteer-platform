import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const EMPTY: ContactForm = { name: '', email: '', message: '' };

export function useContactLogic() {
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'حدث خطأ ما'); setStatus('error'); return; }
      setStatus('success');
      setForm(EMPTY);
    } catch {
      setErrorMsg('تعذّر الاتصال بالخادم');
      setStatus('error');
    }
  };

  const resetStatus = () => setStatus('idle');

  return { form, status, errorMsg, handleChange, handleSubmit, resetStatus };
}