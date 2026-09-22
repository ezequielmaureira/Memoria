import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppAuthProvider } from "./lib/auth.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppAuthProvider>
        <App />
      </AppAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
