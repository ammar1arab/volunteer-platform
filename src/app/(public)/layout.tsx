import "@/presentation/styles/globals.scss";
import { Footer, Header, AnimatedBackground } from "@/presentation/components";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;