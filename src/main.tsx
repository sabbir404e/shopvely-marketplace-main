import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import "./i18n";

const Loading = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <Suspense fallback={<Loading />}>
            <App />
        </Suspense>
    </ErrorBoundary>
);
