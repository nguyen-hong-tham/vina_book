export default function Footer() {
  return (
    <footer className="mt-10 border-t py-4 text-center">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} MyWebsite
      </p>
    </footer>
  );
}