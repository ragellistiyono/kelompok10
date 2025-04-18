import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Desktop } from "./screens/Desktop";
import './i18n';

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Desktop />
  </StrictMode>,
);