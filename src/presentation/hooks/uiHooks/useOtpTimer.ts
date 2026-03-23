import { useState, useEffect } from "react";

export const useOtpTimer = () => {
  const [cooldown, setCooldown] = useState(0);
  const [total,    setTotal]    = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const start = (seconds: number) => {
    setTotal(seconds);
    setCooldown(seconds);
  };

  return { cooldown, total, start };
};