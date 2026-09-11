"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { captureOnce } from "@/lib/utils/captureOnce";
import { isVolunteerMeetingPath } from "@/presentation/constants";

const Chatbot = dynamic(() => import("./Chatbot"), {
  ssr: false,
  loading: () => null,
});

class ChatErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    captureOnce(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function ChatbotWrapper() {
  const pathname = usePathname();
  if (isVolunteerMeetingPath(pathname)) return null;
  return (
    <ChatErrorBoundary key={pathname}>
      <Chatbot />
    </ChatErrorBoundary>
  );
}
