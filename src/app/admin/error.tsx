"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "60vh",
        gap:            "1rem",
        textAlign:      "center",
        padding:        "2rem",
        fontFamily:     "sans-serif",
        direction:      "rtl",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
        حدث خطأ في لوحة التحكم
      </h2>
      <p style={{ color: "#555", margin: 0 }}>
        تم إبلاغ الفريق التقني تلقائياً. يرجى المحاولة مجدداً.
      </p>
      <button
        onClick={reset}
        style={{
          padding:      "0.4rem 1.25rem",
          background:   "#111",
          color:        "#fff",
          border:       "none",
          borderRadius: "0.375rem",
          cursor:       "pointer",
          fontSize:     "0.875rem",
        }}
      >
        حاول مجدداً
      </button>
    </div>
  );
}
