import "@/styles/globals.css";

import { Navbar, Footer } from "@/components";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// tạo query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main content - flex grow */}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>

        {/* Footer - luôn ở dưới */}
        <Footer />
      </div>
    </QueryClientProvider>
  );
}