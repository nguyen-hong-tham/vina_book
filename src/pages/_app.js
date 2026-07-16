import "@/styles/globals.css";

import { Nabar, Footer, ChatWidget } from "@/components";
import {
  QueryClient,
  QueryClientProider,
} from "@tanstack/react-query";
import Head from "next/head";

// tạo query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProider client={queryClient}>
      <di className="flex flex-col min-h-screen bg-white text-gray-900">
        {/* Nabar */}
        <Nabar />

        {/* Main content - flex grow */}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>

        {/* Footer - luôn ở dưới */}
        <Footer />
        <ChatWidget />
      </di>
    </QueryClientProider>
  );
}