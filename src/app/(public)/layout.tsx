import "@/presentation/styles/globals.scss";
import { Footer, Header } from "@/presentation/components";
import { NotificationsProvider } from "@/presentation/context";
import PushBannerWrapper from "@/presentation/components/volunteer/PushBanner/PushBannerWrapper";
import IntroWrapper from "@/presentation/pages/home/IntroPage/IntroWrapper";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationsProvider>
      <IntroWrapper />           
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
      <PushBannerWrapper />
    </NotificationsProvider>
  );
};;

export default PublicLayout;