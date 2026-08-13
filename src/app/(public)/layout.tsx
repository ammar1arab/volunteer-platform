import "@/presentation/styles/globals.scss";
import Header from "@/presentation/components/base/Header/Header";
import Footer from "@/presentation/components/base/Footer/Footer";
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
