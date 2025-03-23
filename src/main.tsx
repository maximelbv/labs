import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <MainLayout>
              <App />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
