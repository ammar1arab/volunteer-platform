import "@/presentation/styles/globals.scss";
import { Footer, Header } from "@/presentation/components";
import { NotificationsProvider } from "@/presentation/context";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationsProvider>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </NotificationsProvider>
  );
};

export default PublicLayout;