import { useEffect, useState } from "react";
import { mapExperimentFileNameToUrl } from "./helpers/string-helpers.tsx";
import ExperimentCard from "./components/ExperimentCard.tsx";

const experimentModules = import.meta.glob(
  "./pages/experiments/**/*.{tsx,jsx}"
);

const App = () => {
  const [experiments, setExperiments] = useState<string[]>([]);

  useEffect(() => {
    const routes = Object.keys(experimentModules).map(
      mapExperimentFileNameToUrl
    );

    setExperiments(routes);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {experiments.map((exp) => (
        <ExperimentCard exp={exp} />
      ))}
    </div>
  );
};

export default App;
