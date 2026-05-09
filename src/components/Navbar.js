import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex-shrink-0 font-bold text-2xl tracking-wide">
            <Link href="/">
              VinaBook
            </Link>
          </div>

          <div className="flex items-center space-x-6 font-medium">
            <Link href="/products" className="hover:text-blue-200 transition-colors">
              Cửa Hàng
            </Link>
            
            <Link href="/cart" className="hover:text-blue-200 transition-colors flex items-center">
              Giỏ Hàng 
              <span className="ml-1 bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full">

              </span>
            </Link>

            <Link href="/profile" className="hover:text-blue-200 transition-colors">
              Tài Khoản
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}