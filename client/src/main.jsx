import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/permanent-marker";
import "@fontsource-variable/caveat";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
