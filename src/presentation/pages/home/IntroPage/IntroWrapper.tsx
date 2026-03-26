"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const IntroPage = dynamic(() => import("./IntroPage"), { ssr: false });

export default function IntroWrapper() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // يظهر فقط في الصفحة الرئيسية
    if (pathname === "/") setActive(true);
  }, [pathname]);

  if (!active) return null;

  return <IntroPage onDone={() => setActive(false)} />;
}