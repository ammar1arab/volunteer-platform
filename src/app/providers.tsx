"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";
import { ImagePreviewProvider } from "@/presentation/providers/ImagePreviewProvider";
import { API_ENDPOINTS } from "@/lib/config/api-endpoints";
import { trackVisitor } from "@/lib/utils";

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

function TrafficBeacon() {
  const path = usePathname();
  const { data: session, status } = useSession();
  const identity = session?.user?.id ?? "guest";
  const admin = session?.user?.role === "ADMIN";
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || status === "loading" || admin || !path ||
      path.startsWith("/admin") || path.startsWith("/signin") || path.startsWith("/signup")) return;
    const record = () => {
      if (document.visibilityState === "visible") void trackVisitor(API_ENDPOINTS.ANALYTICS.HIT, identity);
    };
    record();
    document.addEventListener("visibilitychange", record);
    window.addEventListener("focus", record);
    return () => {
      document.removeEventListener("visibilitychange", record);
      window.removeEventListener("focus", record);
    };
  }, [path, identity, status, admin]);
  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ImagePreviewProvider>
          <SentryUserSync />
          <TrafficBeacon />
          {children}
        </ImagePreviewProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
