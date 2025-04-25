import { ReactNode } from "react";
import Header from "../components/Header";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative">
      <Header className="absolute !z-999" />
      <div className="w-full h-[100svh]">{children}</div>
    </div>
  );
};

export default MainLayout;
