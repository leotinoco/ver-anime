"use client";

import { useReducer, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, X, User as UserIcon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { useAppStore } from "@/store/useAppStore";

interface User {
  id: string;
  username: string;
  avatar?: string;
  role?: string;
}

interface Notification {
  href: string;
  animeTitle: string;
  episodeNumber: number;
}

// 1. Reducer for UI state
interface NavbarState {
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  showNotifications: boolean;
  showRatingsDropdown: boolean;
}

type NavbarAction =
  | { type: "SET_SCROLLED"; payload: boolean }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "SET_MOBILE_MENU"; payload: boolean }
  | { type: "TOGGLE_NOTIFICATIONS" }
  | { type: "SET_NOTIFICATIONS_OPEN"; payload: boolean }
  | { type: "TOGGLE_RATINGS_DROPDOWN" }
  | { type: "SET_RATINGS_DROPDOWN"; payload: boolean };

const navbarReducer = (state: NavbarState, action: NavbarAction): NavbarState => {
  switch (action.type) {
    case "SET_SCROLLED":
      return { ...state, isScrolled: action.payload };
    case "TOGGLE_MOBILE_MENU":
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    case "SET_MOBILE_MENU":
      return { ...state, mobileMenuOpen: action.payload };
    case "TOGGLE_NOTIFICATIONS":
      return { ...state, showNotifications: !state.showNotifications };
    case "SET_NOTIFICATIONS_OPEN":
      return { ...state, showNotifications: action.payload };
    case "TOGGLE_RATINGS_DROPDOWN":
      return { ...state, showRatingsDropdown: !state.showRatingsDropdown };
    case "SET_RATINGS_DROPDOWN":
      return { ...state, showRatingsDropdown: action.payload };
    default:
      return state;
  }
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Navbar() {
  const [state, dispatch] = useReducer(navbarReducer, {
    isScrolled: false,
    mobileMenuOpen: false,
    showNotifications: false,
    showRatingsDropdown: false,
  });

  const { isScrolled, mobileMenuOpen, showNotifications, showRatingsDropdown } = state;

  const notifRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const { push } = useRouter();
  const pathname = usePathname();

  // SWR for data fetching instead of manual useEffects
  const { data: authData } = useSWR<{ authenticated: boolean; user: User }>("/api/auth/me", fetcher);
  const user = authData?.authenticated ? authData.user : null;

  const { data: notifData } = useSWR<{ authenticated: boolean; notifications: Notification[] }>(
    user ? "/api/notifications" : null,
    fetcher
  );
  const notifications = notifData?.notifications || [];

  useEffect(() => {
    const handleScroll = () => {
      dispatch({ type: "SET_SCROLLED", payload: window.scrollY > 0 });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        dispatch({ type: "SET_NOTIFICATIONS_OPEN", payload: false });
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        dispatch({ type: "SET_RATINGS_DROPDOWN", payload: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Categorías", href: "/categorias" },
    {
      name: "Mejor calificados",
      href: "/mejor-calificados",
      submenu: [
        { name: "En emisión", href: "/mejor-calificados" },
        { name: "Top MyAnimeList", href: "/mejor-calificados-myanimelist" },
      ],
    },
    ...(user ? [{ name: "Mi Lista", href: "/favoritos" }] : []),
  ];

  if (user?.role === "admin") {
    navLinks.push({ name: "Admin", href: "/admin" });
  }

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-[#141414] shadow-md" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-primary font-semibold text-2xl tracking-tight hover:scale-105 transition-transform">
            Anime Fan
          </Link>

          <DesktopNav
            navLinks={navLinks}
            pathname={pathname}
            showRatingsDropdown={showRatingsDropdown}
            dropdownRef={dropdownRef}
            dispatch={dispatch}
          />
        </div>

        <UserActions
          user={user}
          notifications={notifications}
          isSearchOpen={isSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchOpen={setSearchOpen}
          handleSearch={handleSearch}
          showNotifications={showNotifications}
          notifRef={notifRef}
          mobileMenuOpen={mobileMenuOpen}
          dispatch={dispatch}
        />
      </div>

      <MobileMenu
        navLinks={navLinks}
        pathname={pathname}
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        dispatch={dispatch}
      />
    </header>
  );
}

// Subcomponents

function DesktopNav({ navLinks, pathname, showRatingsDropdown, dropdownRef, dispatch }: any) {
  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-200">
      {navLinks.map((link: any) => (
        <div key={link.name} className="relative group/nav" ref={link.submenu ? dropdownRef : null}>
          {link.submenu ? (
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-1 cursor-pointer transition-colors hover:text-white text-zinc-400 py-2"
              onMouseEnter={() => dispatch({ type: "SET_RATINGS_DROPDOWN", payload: true })}
              onClick={() => dispatch({ type: "TOGGLE_RATINGS_DROPDOWN" })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  dispatch({ type: "TOGGLE_RATINGS_DROPDOWN" });
                }
              }}
            >
              {link.name}
              <m.span animate={{ rotate: showRatingsDropdown ? 180 : 0 }}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </m.span>

              <AnimatePresence>
                {showRatingsDropdown && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => dispatch({ type: "SET_RATINGS_DROPDOWN", payload: false })}
                    className="absolute top-full left-0 w-48 bg-[#141414] border border-zinc-800 rounded shadow-2xl py-2 mt-1"
                  >
                    {link.submenu.map((sub: any) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`block px-4 py-2 hover:bg-zinc-800 transition-colors ${
                          pathname === sub.href ? "text-primary font-semibold" : "text-zinc-300"
                        }`}
                        onClick={() => dispatch({ type: "SET_RATINGS_DROPDOWN", payload: false })}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href={link.href}
              className={`transition-colors hover:text-white py-2 ${
                pathname === link.href ? "text-white font-semibold" : "text-zinc-400"
              }`}
            >
              {link.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function UserActions({
  user,
  notifications,
  isSearchOpen,
  searchQuery,
  setSearchQuery,
  setSearchOpen,
  handleSearch,
  showNotifications,
  notifRef,
  mobileMenuOpen,
  dispatch,
}: any) {
  return (
    <div className="flex items-center gap-4 md:gap-6 text-white">
      <div className="relative flex items-center">
        {isSearchOpen && (
          <m.input
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            type="text"
            placeholder="Películas, programas, anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="bg-black/80 border border-white/80 outline-none text-white text-sm px-4 py-1.5 mr-2 rounded-sm"
            onBlur={() => {
              if (!searchQuery) setSearchOpen(false);
            }}
          />
        )}
        <button
          aria-label="Search"
          title="Search"
          className="hover:text-zinc-300 transition-colors"
          onClick={() => {
            if (!isSearchOpen) {
              setSearchOpen(true);
            } else {
              handleSearch();
            }
          }}
        >
          <Search className="size-5" />
        </button>
      </div>

      {user && (
        <div className="relative" ref={notifRef}>
          <button
            aria-label="Notificaciones"
            title="Notificaciones"
            className="relative hover:text-zinc-300 transition-colors"
            onClick={() => dispatch({ type: "TOGGLE_NOTIFICATIONS" })}
          >
            <Bell className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full text-[9px] font-semibold flex items-center justify-center text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <m.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute -right-20 md:right-0 top-full mt-3 w-[calc(100vw-2rem)] md:w-72 max-w-[360px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[200] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">Notificaciones</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                      {notifications.length} sin ver
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-zinc-500 text-xs text-center py-6">No hay nuevas notificaciones</p>
                  ) : (
                    notifications.map((n: Notification, i: number) => (
                      <Link
                        key={n.href + i}
                        href={n.href}
                        onClick={() => dispatch({ type: "SET_NOTIFICATIONS_OPEN", payload: false })}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                      >
                        <span className="mt-0.5 size-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-white text-xs font-semibold leading-tight">Nuevo episodio: {n.animeTitle}</p>
                          <p className="text-zinc-400 text-[10px] mt-0.5">Episodio {n.episodeNumber} disponible</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-800 px-4 py-3">
                  <Link
                    href="/notificaciones"
                    onClick={() => dispatch({ type: "SET_NOTIFICATIONS_OPEN", payload: false })}
                    className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    Configurar notificaciones
                  </Link>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Link
        href={user ? "/perfil" : "/login"}
        className="flex items-center gap-2 cursor-pointer group"
        aria-label={user ? "Mi Perfil" : "Iniciar Sesión"}
        title={user ? "Mi Perfil" : "Iniciar Sesión"}
      >
        <div className={`size-8 rounded flex items-center justify-center overflow-hidden transition-colors relative ${user ? "bg-primary" : "bg-zinc-800"}`}>
          {user?.avatar ? (
            <Image src={user.avatar} alt={user.username} fill sizes="32px" className="object-cover" />
          ) : (
            <UserIcon className={`size-5 ${user ? "text-white" : "text-zinc-300 group-hover:text-white"}`} />
          )}
        </div>
        {user && <span className="hidden lg:inline text-xs font-semibold text-zinc-300 group-hover:text-white">{user.username}</span>}
      </Link>

      <button
        aria-label="Toggle mobile menu"
        title="Toggle mobile menu"
        className="md:hidden text-white"
        onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}
      >
        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
    </div>
  );
}

function MobileMenu({ navLinks, pathname, user, mobileMenuOpen, dispatch }: any) {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-[#141414] py-4 border-t border-zinc-800 shadow-xl"
        >
          <nav className="flex flex-col px-4 gap-4">
            {navLinks.map((link: any) => (
              <div key={link.name}>
                {link.submenu ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm text-zinc-500 font-semibold uppercase tracking-widest">{link.name}</span>
                    <div className="flex flex-col gap-3 pl-4 border-l border-zinc-800">
                      {link.submenu.map((sub: any) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => dispatch({ type: "SET_MOBILE_MENU", payload: false })}
                          className={`text-sm ${pathname === sub.href ? "text-primary font-semibold" : "text-zinc-400"}`}
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
                    onClick={() => dispatch({ type: "SET_MOBILE_MENU", payload: false })}
                    className={`text-sm ${pathname === link.href ? "text-white font-semibold" : "text-zinc-400"}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            {user && (
              <Link
                href="/notificaciones"
                onClick={() => dispatch({ type: "SET_MOBILE_MENU", payload: false })}
                className="text-sm text-zinc-400 flex items-center gap-2"
              >
                <Bell className="size-4" />
                Notificaciones
              </Link>
            )}
          </nav>
        </m.div>
      )}
    </AnimatePresence>
  );
}
