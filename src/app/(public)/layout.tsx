import "@/presentation/styles/globals.scss";
import { Footer, Header } from "@/presentation/components";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;