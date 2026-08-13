"use client";

import { usePathname } from "next/navigation";
import Footer from "@/presentation/components/base/Footer/Footer";
import PushBannerWrapper from "@/presentation/components/volunteer/PushBanner/PushBannerWrapper";
import ChatbotWrapper from "@/presentation/components/volunteer/Chatbot/ChatbotWrapper";
import { isVolunteerMeetingPath } from "@/presentation/constants";

export default function PublicExtras() {
  const pathname = usePathname();
  if (isVolunteerMeetingPath(pathname)) return null;

  return (
    <>
      <Footer />
      <PushBannerWrapper />
      <ChatbotWrapper />
    </>
  );
}
