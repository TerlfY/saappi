import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { DarkModeProvider } from "./DarkModeContext";
import ErrorBoundary from "./ErrorBoundary";
import "./main.css";
import "./App.css";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
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
}
