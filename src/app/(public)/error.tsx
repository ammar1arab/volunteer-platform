"use client";

import { captureOnce } from "@/lib/utils/captureOnce";

export default function PublicError({
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
        minHeight:      "60vh",
        gap:            "1rem",
        textAlign:      "center",
        padding:        "2rem",
        fontFamily:     "sans-serif",
        direction:      "rtl",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        حدث خطأ غير متوقع
      </h1>
      <p style={{ color: "#555", margin: 0 }}>
        نعتذر عن الإزعاج. يرجى المحاولة مجدداً.
      </p>
      <button
        onClick={reset}
        style={{
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
    </div>
  );
}
