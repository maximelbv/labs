import { useEffect, useState } from "react";
import { Link } from "react-router";
import { mapExperimentFileNameToUrl } from "./helpers/string-helpers.tsx";

const experimentModules = import.meta.glob("./pages/experiments/**/*.tsx");

const App = () => {
  const [experiments, setExperiments] = useState<string[]>([]);

  useEffect(() => {
    const routes = Object.keys(experimentModules).map(
      mapExperimentFileNameToUrl
    );

    setExperiments(routes);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {experiments.map((exp) => (
        <Link key={exp} to={`/${exp}`}>
          {exp}
        </Link>
      ))}
    </div>
  );
};

export default App;
