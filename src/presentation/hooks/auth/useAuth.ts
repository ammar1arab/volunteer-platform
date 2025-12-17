import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UseAuthOptions {
  requireAuth?: boolean;
  requireRole?: 'ADMIN' | 'VOLUNTEER';
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    requireAuth = true,
    requireRole,
    redirectTo = '/login',
  } = options;

  useEffect(() => {
    if (status === 'loading') return;

    if (requireAuth && status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (requireRole && session?.user?.role !== requireRole) {
      const fallbackPath = session?.user?.role === 'ADMIN' 
        ? '/admin/dashboard' 
        : '/volunteer/profile';
      
      router.push(fallbackPath);
    }
  }, [status, session, requireAuth, requireRole, redirectTo, router]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  };
};