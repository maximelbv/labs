import { Link } from "react-router";
import Logo from "./Logo";
import { MAXIMELBV_LINK } from "../constants/links";
import { useEffect, useState } from "react";
import { mapExperimentFileNameToUrl } from "../helpers/string-helpers";
import ExperimentCard from "./ExperimentCard";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import LogoMini from "./LogoMini";
import { getDeviceType } from "../helpers/device-helper";

const experimentModules = import.meta.glob(
  "../pages/experiments/**/*.{tsx,jsx}"
);

type ExperimentMeta = {
  slug: string;
  title: string;
  category: string;
  cover: string;
  date: string;
};

type ExperimentModule = {
  default: unknown;
  meta?: ExperimentMeta;
};

const Header = ({ className }: { className?: string }) => {
  const [experiments, setExperiments] = useState<ExperimentMeta[]>([]);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(true);
  const device = getDeviceType();

  useEffect(() => {
    const load = async () => {
      const entries = await Promise.all(
        Object.entries(experimentModules).map(async ([path, loader]) => {
          const mod = (await loader()) as ExperimentModule;
          const slug = mapExperimentFileNameToUrl(path);
          const meta = mod.meta ?? {
            title: slug,
            category: "Uncategorized",
            cover: `experimentsPreviews/placeholder.png`,
            date: "",
          };
          return {
            slug,
            ...meta,
          };
        })
      );

      const sorted = entries.sort((a, b) => {
        const dateA = new Date(a.date ?? 0).getTime();
        const dateB = new Date(b.date ?? 0).getTime();
        return dateB - dateA;
      });

      setExperiments(sorted);
    };

    load();
  }, []);

  useEffect(() => {
    if (device !== "mouse") {
      setIsOpenDrawer(false);
    }
  }, [device]);

  const handleCloseDrawer = () => {
    setIsOpenDrawer(!isOpenDrawer);
  };

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out flex flex-col justify-start gap-4 h-[100svh] ${
        isOpenDrawer ? "w-100" : "w-16"
      } ${className}`}
    >
      <button
        className="absolute top-[10px] right-[-30px] z-999 cursor-pointer"
        onClick={handleCloseDrawer}
      >
        {isOpenDrawer ? (
          <PanelLeftClose className="text-text-muted-light hover:text-text-muted transition-all duration-300 ease-in-out" />
        ) : (
          <PanelLeftOpen className="text-text-muted-light hover:text-text-muted transition-all duration-300 ease-in-out" />
        )}
      </button>
      <div className="p-4 pb-0 flex justify-between items-start">
        <div className="flex flex-col gap-1 w-100">
          <Link to="/">{isOpenDrawer ? <Logo /> : <LogoMini />}</Link>
        </div>
      </div>

      <div className="overflow-y-auto">
        <div
          className={`flex-1 ${
            isOpenDrawer ? "p-4 gap-4" : "p-1 gap-1"
          } pt-0 flex flex-col`}
        >
          {experiments.map((exp) => (
            <ExperimentCard
              isOpenDrawer={isOpenDrawer}
              key={exp.slug}
              {...exp}
            />
          ))}
        </div>
      </div>

      <div className="p-4 pt-0">
        <a href={MAXIMELBV_LINK} target="blank_">
          {isOpenDrawer ? (
            <img className="!object-contain" src="/maximelbv-logo.svg" />
          ) : (
            <img className="!object-contain" src="/maximelbv-logo-mini.svg" />
          )}
        </a>
      </div>
    </div>
  );
};

export default Header;
