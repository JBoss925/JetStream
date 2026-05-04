import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./routes/App";
import { registerServiceWorker } from "./serviceWorker";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
