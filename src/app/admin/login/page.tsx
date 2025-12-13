import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { LoginForm } from '@/presentation/components';

const LoginPage = async () => {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/admin/dashboard');
  }

  return <LoginForm />;
}

export default LoginPage