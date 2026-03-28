import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { BrowserRouter as Router } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <HeroUIProvider>
    <Router>
      <App />
    </Router>
  </HeroUIProvider>
);
