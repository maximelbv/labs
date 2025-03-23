import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Header />
      <div className="p-4">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
