"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";

function SentryUserSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
        username: session.user.name ?? undefined
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

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
