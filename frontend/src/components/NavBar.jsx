import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import SpotlightSearch from "./SpotlightSearch";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const { isAuthenticated, logout, role, name, avatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenSpotlight = () => setSpotlightOpen(true);
    document.addEventListener("open-spotlight", handleOpenSpotlight);
    return () => document.removeEventListener("open-spotlight", handleOpenSpotlight);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideMobile = (e) => {
      if (mobileOpen && !e.target.closest('.mobile-menu-container')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMobile);
    return () => document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, [mobileOpen]);

  const navLinks = [
    { label: "Browse", path: "/browse" },
    { label: "Sell", path: "/create-product", auth: true },
    { label: "Library", path: "/library", auth: true },
    { label: "Admin", path: "/admin", auth: true, admin: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <img 
                src="/favicon_io/android-chrome-192x192.png" 
                alt="AnarchyBay" 
                className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black"
              />
              <span className="font-display text-2xl sm:text-4xl text-black tracking-tight italic">
                AnarchyBay
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => {
                if (link.auth && !isAuthenticated) return null;
                if (link.admin && role !== 'admin') return null;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-5 py-2.5 text-base font-bold uppercase tracking-wide border-3 border-black transition-all ${
                      isActive(link.path)
                        ? "bg-[var(--yellow-400)] shadow-[3px_3px_0px_var(--black)]"
                        : "bg-white hover:bg-[var(--yellow-400)] hover:shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSpotlightOpen(true)}
                className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 flex items-center justify-center gap-2 border-3 border-black bg-white hover:bg-[var(--yellow-400)] hover:shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                title="Search (⌘K)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline text-sm font-bold">⌘K</span>
              </button>

              {isAuthenticated ? (
                <div className="hidden lg:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-3 border-black bg-[var(--pink-100)] hover:shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all overflow-hidden"
                    title={name || "Profile"}
                  >
                    {avatar ? (
                      <img src={avatar} alt={name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold">{(name || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                  
                  {avatarDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] z-50 animate-liquid-dropdown">
                      <div className="px-4 py-3 border-b-3 border-black bg-[var(--pink-50)]">
                        <p className="font-bold truncate">{name || "User"}</p>
                        <p className="text-xs text-gray-500 uppercase">{role || "Customer"}</p>
                      </div>
                      <button
                        onClick={() => { navigate("/dashboard"); setAvatarDropdownOpen(false); }}
                        className="w-full px-4 py-3 text-left font-bold uppercase text-sm hover:bg-[var(--yellow-400)] border-b-3 border-black flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </button>
                      <button
                        onClick={() => { navigate("/settings/profile"); setAvatarDropdownOpen(false); }}
                        className="w-full px-4 py-3 text-left font-bold uppercase text-sm hover:bg-[var(--yellow-400)] border-b-3 border-black flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                      <button
                        onClick={() => { navigate("/cart"); setAvatarDropdownOpen(false); }}
                        className="w-full px-4 py-3 text-left font-bold uppercase text-sm hover:bg-[var(--yellow-400)] border-b-3 border-black flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Cart
                      </button>
                      <button
                        onClick={() => { logout(); setAvatarDropdownOpen(false); }}
                        className="w-full px-4 py-3 text-left font-bold uppercase text-sm hover:bg-red-100 text-red-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="hidden md:flex px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base font-bold uppercase tracking-wide border-3 border-black bg-white hover:bg-[var(--yellow-400)] hover:shadow-[3px_3px_0px_var(--black)] transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="hidden sm:flex px-4 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-bold uppercase tracking-wide border-3 border-black bg-[var(--pink-500)] text-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
                  >
                    Get Started
                  </button>
                </>
              )}

              <div className="mobile-menu-container relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileOpen(!mobileOpen);
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center gap-1.5 border-3 border-black bg-white hover:bg-[var(--yellow-400)] transition-colors relative overflow-hidden"
                >
                  <span className={`w-5 h-0.5 bg-black transition-all duration-300 ease-out ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} />
                  <span className={`w-5 h-0.5 bg-black transition-all duration-300 ease-out ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>

                {mobileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] overflow-hidden animate-liquid-menu z-50">
                    {navLinks.map((link) => {
                      if (link.auth && !isAuthenticated) return null;
                      if (link.admin && role !== 'admin') return null;
                      return (
                        <button
                          key={link.path}
                          onClick={() => navigate(link.path)}
                          className={`w-full px-4 py-4 text-base font-bold uppercase text-left border-b-3 border-black transition-all ${
                            isActive(link.path) ? "bg-[var(--yellow-400)]" : "hover:bg-[var(--yellow-400)]"
                          }`}
                        >
                          {link.label}
                        </button>
                      );
                    })}
                    {isAuthenticated && (
                      <>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className={`w-full px-4 py-4 text-base font-bold uppercase text-left border-b-3 border-black hover:bg-[var(--yellow-400)] ${
                            isActive("/dashboard") ? "bg-[var(--yellow-400)]" : ""
                          }`}
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => navigate("/settings/profile")}
                          className={`w-full px-4 py-4 text-base font-bold uppercase text-left border-b-3 border-black hover:bg-[var(--yellow-400)] ${
                            isActive("/settings/profile") ? "bg-[var(--yellow-400)]" : ""
                          }`}
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => navigate("/cart")}
                          className={`w-full px-4 py-4 text-base font-bold uppercase text-left border-b-3 border-black hover:bg-[var(--yellow-400)] ${
                            isActive("/cart") ? "bg-[var(--yellow-400)]" : ""
                          }`}
                        >
                          Cart
                        </button>
                        <button
                          onClick={() => { logout(); setMobileOpen(false); }}
                          className="w-full px-4 py-4 text-base font-bold uppercase text-left hover:bg-red-100 text-red-600"
                        >
                          Logout
                        </button>
                      </>
                    )}
                    {!isAuthenticated && (
                      <>
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full px-4 py-4 text-base font-bold uppercase text-left hover:bg-[var(--yellow-400)] border-b-3 border-black"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => navigate("/signup")}
                          className="w-full px-4 py-4 text-base font-bold uppercase text-left bg-[var(--pink-500)] text-white"
                        >
                          Get Started
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SpotlightSearch isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </>
  );
}