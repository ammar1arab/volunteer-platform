"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isVolunteerMeetingPath } from "@/presentation/constants";

const Chatbot = dynamic(() => import("./Chatbot"), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotWrapper() {
  const pathname = usePathname();
  if (isVolunteerMeetingPath(pathname)) return null;
  return <Chatbot />;
}
