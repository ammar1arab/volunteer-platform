"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const IntroPage = dynamic(() => import("./IntroPage"), { ssr: false });

export default function IntroWrapper() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setDismissed(pathname !== "/");
  }

  if (pathname !== "/" || dismissed) return null;

  return <IntroPage onDone={() => setDismissed(true)} />;
}
