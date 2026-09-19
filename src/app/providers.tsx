"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { QueryProvider } from "@/presentation/query";
import { ImagePreviewProvider } from "@/presentation/providers/ImagePreviewProvider";
import { API_ENDPOINTS } from "@/lib/config/api-endpoints";
import { pingOnce } from "@/lib/utils";

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
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/signin") || path.startsWith("/signup")) return null;
  pingOnce("basmat-traffic-hit", API_ENDPOINTS.ANALYTICS.HIT, { referrer: document.referrer });
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
