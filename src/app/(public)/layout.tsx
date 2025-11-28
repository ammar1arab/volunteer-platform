import "@/presentation/styles/global.scss";
import { Footer, Header } from "@/presentation/components";

const PublicLayout = ({ children }: { children: React.ReactNode; }) => {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
export default PublicLayout