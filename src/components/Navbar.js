import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const fetchCurrentUser = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data.user;
};

export default function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    retry: false,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      await queryClient.removeQueries({ queryKey: ['current-user'] });
      setDropdownOpen(false);
      router.push('/login');
    } catch (error) {
      setDropdownOpen(false);
      router.push('/login');
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="shrink-0 font-bold text-2xl tracking-wide">
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

            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="hover:text-blue-200 transition-colors font-semibold flex items-center gap-1"
                >
                  Xin chào, {user.name}
                  <span className={`text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 mt-3 w-44 rounded-xl bg-white text-slate-900 shadow-lg border border-slate-200 py-2 overflow-hidden">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
                    >
                      Hồ sơ
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-red-600"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/login" className="hover:text-blue-200 transition-colors">
                Tài Khoản
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}