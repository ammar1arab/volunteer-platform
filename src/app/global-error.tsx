"use client";

import { useCaptureOnce } from "@/lib/utils/captureOnce";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureOnce(error);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          minHeight:      "100vh",
          fontFamily:     "sans-serif",
          gap:            "1rem",
          padding:        "2rem",
          textAlign:      "center",
          background:     "#fff",
          color:          "#111",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          حدث خطأ غير متوقع
        </h1>
        <p style={{ color: "#555", margin: 0 }}>
          نعتذر عن الإزعاج. يرجى المحاولة مجدداً.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop:    "0.5rem",
            padding:      "0.5rem 1.5rem",
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
      </body>
    </html>
  );
}
