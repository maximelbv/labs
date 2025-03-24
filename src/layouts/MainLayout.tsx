import { ReactNode } from "react";
import Header from "../components/Header";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Header />
      <div className="px-4">{children}</div>
    </div>
  );
};

export default MainLayout;
