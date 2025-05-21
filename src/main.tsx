import { createRoot } from "react-dom/client";
import "./globals.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout.tsx";
import { lazy, Suspense, ComponentType } from "react";
import { mapExperimentFileNameToUrl } from "./helpers/string-helpers.tsx";

const experimentModules = import.meta.glob(
  "./pages/experiments/**/*.{tsx,jsx}"
) as Record<string, () => Promise<{ default: ComponentType<unknown> }>>;

// const preloadExperiments = () => {
//   Object.values(experimentModules).forEach((importModule) => importModule());
// };

const generateExperimentRoutes = () => {
  return Object.entries(experimentModules).map(([path, importModule]) => {
    const routeName = mapExperimentFileNameToUrl(path);
    const Component = lazy(importModule);
    return (
      <Route
        key={routeName}
        path={`/${routeName}`}
        element={
          <Suspense fallback={null}>
            <MainLayout>
              <Component />
            </MainLayout>
          </Suspense>
        }
      />
    );
  });
};

const RootApp = () => {
  // useEffect(() => {
  //   preloadExperiments();
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <App />
            </MainLayout>
          }
        />
        {generateExperimentRoutes()}
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(
  // Le strict mode commenté car il monte/démonte 2 fois, ce qui fait beuguer le moteur physique
  // <StrictMode>
  <RootApp />
  // </StrictMode>
);
