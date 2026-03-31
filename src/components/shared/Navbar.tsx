'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const [showRatingsDropdown, setShowRatingsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRatingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Categorías', href: '/categorias' },
    { 
      name: 'Mejor calificados', 
      href: '/mejor-calificados',
      submenu: [
        { name: 'En emisión', href: '/mejor-calificados' },
        { name: 'Top MyAnimeList', href: '/mejor-calificados-myanimelist' }
      ]
    },
    // Only show Mi Lista when authenticated
    ...(user ? [{ name: 'Mi Lista', href: '/favoritos' }] : []),
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#141414] shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="text-primary font-bold text-2xl tracking-tight hover:scale-105 transition-transform">
            Anime Fan
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-200">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group/nav" ref={link.submenu ? dropdownRef : null}>
                {link.submenu ? (
                  <div 
                    className="flex items-center gap-1 cursor-pointer transition-colors hover:text-white text-gray-400 py-2"
                    onMouseEnter={() => setShowRatingsDropdown(true)}
                    onClick={() => setShowRatingsDropdown(!showRatingsDropdown)}
                  >
                    {link.name}
                    <motion.span animate={{ rotate: showRatingsDropdown ? 180 : 0 }}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.span>
                    
                    <AnimatePresence>
                      {showRatingsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          onMouseLeave={() => setShowRatingsDropdown(false)}
                          className="absolute top-full left-0 w-48 bg-[#141414] border border-zinc-800 rounded shadow-2xl py-2 mt-1"
                        >
                          {link.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={`block px-4 py-2 hover:bg-zinc-800 transition-colors ${
                                pathname === sub.href ? 'text-primary font-bold' : 'text-gray-300'
                              }`}
                              onClick={() => setShowRatingsDropdown(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={`transition-colors hover:text-white py-2 ${
                      pathname === link.href ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-4 md:gap-6 text-white">
          <div className="relative flex items-center">
            {isSearchOpen && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                type="text"
                placeholder="Películas, programas, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
                    setSearchOpen(false);
                  }
                }}
                className="bg-black/80 border border-white/80 outline-none text-white text-sm px-4 py-1.5 mr-2 rounded-sm"
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
              />
            )}
            <button 
              aria-label="Search" 
              title="Search" 
              className="hover:text-gray-300 transition-colors"
              onClick={() => {
                if (!isSearchOpen) {
                  setSearchOpen(true);
                } else if (searchQuery.trim() !== '') {
                  router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
                  setSearchOpen(false);
                }
              }}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          <button aria-label="Notifications" title="Notifications" className="hidden md:block hover:text-gray-300 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <Link 
            href={user ? '/perfil' : '/login'} 
            className="flex items-center gap-2 cursor-pointer group"
            aria-label={user ? 'Mi Perfil' : 'Iniciar Sesión'}
            title={user ? 'Mi Perfil' : 'Iniciar Sesión'}
          >
            <div className={`w-8 h-8 rounded flex items-center justify-center overflow-hidden transition-colors ${user ? 'bg-primary' : 'bg-zinc-800'}`}>
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
               ) : (
                 <UserIcon className={`w-5 h-5 ${user ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
               )}
            </div>
            {user && <span className="hidden lg:inline text-xs font-bold text-gray-300 group-hover:text-white">{user.username}</span>}
          </Link>

          <button 
            aria-label="Toggle mobile menu"
            title="Toggle mobile menu"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#141414] py-4 border-t border-zinc-800 shadow-xl"
          >
            <nav className="flex flex-col px-4 gap-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.submenu ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">{link.name}</span>
                      <div className="flex flex-col gap-3 pl-4 border-l border-zinc-800">
                        {link.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-sm ${
                              pathname === sub.href ? 'text-primary font-bold' : 'text-gray-400'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm ${
                        pathname === link.href ? 'text-white font-bold' : 'text-gray-400'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
