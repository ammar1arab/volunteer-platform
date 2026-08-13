"use client";

import { captureOnce } from "@/lib/utils/captureOnce";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  captureOnce(error);

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "100vh",
        gap:            "1rem",
        textAlign:      "center",
        padding:        "2rem",
        fontFamily:     "sans-serif",
        direction:      "rtl",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
        حدث خطأ
      </h2>
      <p style={{ color: "#555", margin: 0 }}>
        يرجى المحاولة مجدداً أو العودة لتسجيل الدخول.
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
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
        <Link
          href="/signin"
          style={{
            padding:      "0.4rem 1.25rem",
            background:   "transparent",
            color:        "#111",
            border:       "1px solid #ccc",
            borderRadius: "0.375rem",
            fontSize:     "0.875rem",
            textDecoration: "none",
          }}
        >
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
