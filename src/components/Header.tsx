import { Link } from "react-router";
import Logo from "./Logo";
import { MAXIMELBV_LINK } from "../constants/links";
import { useEffect, useState } from "react";
import { mapExperimentFileNameToUrl } from "../helpers/string-helpers";
import ExperimentCard from "./ExperimentCard";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import LogoMini from "./LogoMini";

const experimentModules = import.meta.glob(
  "../pages/experiments/**/*.{tsx,jsx}"
);

type ExperimentMeta = {
  slug: string;
  title: string;
  category: string;
  cover: string;
};

type ExperimentModule = {
  default: unknown;
  meta?: ExperimentMeta;
};

const Header = ({ className }: { className?: string }) => {
  const [experiments, setExperiments] = useState<ExperimentMeta[]>([]);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      const entries = await Promise.all(
        Object.entries(experimentModules).map(async ([path, loader]) => {
          const mod = (await loader()) as ExperimentModule;
          const slug = mapExperimentFileNameToUrl(path);
          const meta = mod.meta ?? {
            title: slug,
            category: "Uncategorized",
            cover: `${slug}.jpg`,
          };
          return {
            slug,
            ...meta,
          };
        })
      );
      setExperiments(entries);
    };

    load();
  }, []);

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
          <PanelLeftClose className="text-text-muted-light" />
        ) : (
          <PanelLeftOpen className="text-text-muted-light" />
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
