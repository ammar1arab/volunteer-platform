"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";

let sentryUserKey = "";

function SentryUserSync() {
  const { data: session } = useSession();
  const user = session?.user;
  const key = user?.id ? `${user.id}|${user.email ?? ""}|${user.name ?? ""}` : "";

  if (key !== sentryUserKey) {
    sentryUserKey = key;
    if (user?.id) {
      Sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.name ?? undefined
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
