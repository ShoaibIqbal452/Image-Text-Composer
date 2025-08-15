import "@/styles/globals.css";
import type { AppProps } from "next/app";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "@/components/Toast/ToastContainer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
