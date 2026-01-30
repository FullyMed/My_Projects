import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { validateData } from "./lib/validateData";

if (import.meta.env.DEV) {
  validateData();
}

createRoot(document.getElementById("root")!).render(<App />);
