import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";

export default function NavBar({ onProtectedClick }) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between shadow-black">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="border-2 border-gray-950 px-1 rounded-full text-gray-950 text-primary-foreground font-bold text-xl">B</span>
          </div>
          <span className="font-bold text-xl text-foreground">BitShelf</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-primary transition"
          >
            Home
          </button>
          <a href="#features" className="text-muted-foreground hover:text-primary transition">
            Features
          </a>
          <a href="#products" className="text-muted-foreground hover:text-primary transition">
            Products
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition">
            Pricing
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-primary transition"
              >
                Dashboard
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition btn-pulse"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-gray-950 text-white border-0 rounded-xl text-sm text-muted-foreground hover:text-primary transition"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2  bg-gray-950 text-white border-0 rounded-xl  bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition btn-pulse"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}