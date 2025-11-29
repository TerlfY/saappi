import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { DarkModeProvider } from "./DarkModeContext.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./main.css";
import "./App.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <DarkModeProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </QueryClientProvider>
    </ErrorBoundary>
  </DarkModeProvider>
);
