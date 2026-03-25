"use client";
import dynamic from "next/dynamic";

const PushBanner = dynamic(() => import("./PushBanner"), { ssr: false });

export default function PushBannerWrapper() {
  return <PushBanner />;
}