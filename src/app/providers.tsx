"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";

function SentryUserSync() {
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (user?.id) {
      Sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.name ?? undefined
      });
      return;
    }
    Sentry.setUser(null);
  }, [user?.id, user?.email, user?.name]);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <SentryUserSync />
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}
