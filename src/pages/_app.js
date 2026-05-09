import "@/styles/globals.css";
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <>
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Component {...pageProps} />
    </main>
    </>
  );
}
