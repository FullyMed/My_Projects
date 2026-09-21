import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { validateData } from "./lib/validateData";

if (import.meta.env.DEV) {
  validateData();
}

createRoot(document.getElementById("root")!).render(<App />);

const bootLoader = document.getElementById("app-boot-loader");
if (bootLoader) {
  requestAnimationFrame(() => bootLoader.classList.add("hide"));
  bootLoader.addEventListener("transitionend", () => bootLoader.remove(), { once: true });
  setTimeout(() => bootLoader.remove(), 400);
}