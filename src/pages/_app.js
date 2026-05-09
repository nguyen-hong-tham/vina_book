import "@/styles/globals.css";

import Navbar from "../components/Navbar";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// tạo query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}