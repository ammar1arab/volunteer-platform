import "@/presentation/styles/globals.scss";
import { Footer, Header } from "@/presentation/components";
import { NotificationsProvider } from "@/presentation/context";
import PushBannerWrapper from "@/presentation/components/volunteer/PushBanner/PushBannerWrapper";
import IntroWrapper from "@/presentation/pages/home/IntroPage/IntroWrapper";
import ChatbotWrapper from "@/presentation/components/volunteer/Chatbot/ChatbotWrapper";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <IntroWrapper />

      <NotificationsProvider>
        <Header />
      </NotificationsProvider>
      <main className="main-content">{children}</main>
      <Footer />
      <PushBannerWrapper />
      <ChatbotWrapper />
    </>
  );
};

export default PublicLayout;
