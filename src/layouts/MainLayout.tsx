import { ReactNode } from "react";
import Header from "../components/Header";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex">
      <Header />
      <div className="flex-1 h-[100svh]">{children}</div>
    </div>
  );
};

export default MainLayout;
