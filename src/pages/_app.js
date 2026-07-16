import "@/styles/globals.css";

import { Navbar, Footer,ChatWidget } from "@/components";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Head from "next/head";

// tạo query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-white text-gray-900">
        {/* Navbar */}
        <Navbar />

        {/* Main content - flex grow */}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>

        {/* Footer - luôn ở dưới */}
        <Footer />
        <ChatWidget />
      </div>
    </QueryClientProvider>
  );
}