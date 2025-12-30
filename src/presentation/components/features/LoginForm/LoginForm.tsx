'use client';

import { useState, useTransition, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/presentation/components';
import styles from './LoginForm.module.scss';

interface LoginFormData {
  email: string;
  password: string;
}

const INITIAL_STATE: LoginFormData = {
  email: '',
  password: '',
};

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [credentials, setCredentials] = useState<LoginFormData>(INITIAL_STATE);
  const [error, setError] = useState('');

  const updateField = useCallback(
    (field: keyof LoginFormData) => 
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev: LoginFormData) => ({ ...prev, [field]: e.target.value }));
        setError('');
      },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      if (result?.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Sign in to your dashboard</p>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={styles.fields}>
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={credentials.email}
            onChange={updateField('email')}
            placeholder="admin@volunteer.com"
            disabled={isPending}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={credentials.password}
            onChange={updateField('password')}
            placeholder="••••••••"
            disabled={isPending}
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" loading={isPending}>
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>

        <footer className={styles.footer}>
          <small>Dev: admin@volunteer.com / Admin@123</small>
        </footer>
      </form>
    </div>
  );
}