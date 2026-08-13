"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";

let lastSentryUser: string | null | undefined;

function SentryUserSync() {
  const { data: session } = useSession();
  const nextId = session?.user?.id ?? null;
  if (lastSentryUser !== nextId) {
    lastSentryUser = nextId;
    if (nextId) {
      Sentry.setUser({
        id: session!.user.id,
        email: session!.user.email ?? undefined,
        username: session!.user.name ?? undefined
      });
    } else {
      Sentry.setUser(null);
    }
  }
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
