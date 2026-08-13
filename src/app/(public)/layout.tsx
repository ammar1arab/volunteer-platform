import "@/presentation/styles/globals.scss";
import Header from "@/presentation/components/base/Header/Header";
import { NotificationsProvider } from "@/presentation/context";
import IntroWrapper from "@/presentation/pages/home/IntroPage/IntroWrapper";
import PublicExtras from "./PublicExtras";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <IntroWrapper />

      <NotificationsProvider>
        <Header />
      </NotificationsProvider>
      <main className="main-content">{children}</main>
      <PublicExtras />
    </>
  );
};

export default PublicLayout;
