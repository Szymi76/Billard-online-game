import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GameProvider } from "./useGame.tsx";
import { HeroUIProvider } from "@heroui/system";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </HeroUIProvider>
  </StrictMode>
);
