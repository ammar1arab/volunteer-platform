"use client";

import { useState } from "react";
import { useNow } from "@/presentation/query";

export const useOtpTimer = () => {
  const [endsAt, setEndsAt] = useState(0);
  const [total, setTotal] = useState(60);
  const now = useNow(endsAt > 0);
  const cooldown = endsAt > 0 ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;

  const start = (seconds: number) => {
    setTotal(seconds);
    setEndsAt(Date.now() + seconds * 1000);
  };

  return { cooldown, total, start };
};
