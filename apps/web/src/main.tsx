import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./routes/App";
import { registerServiceWorker } from "./serviceWorker";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
