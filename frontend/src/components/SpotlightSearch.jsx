import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Hash } from "lucide-react";

const BANGS = {
  "!p": { type: "products", label: "Products", icon: ShoppingBag, endpoint: "/api/products/list" },
  "!c": { type: "creators", label: "Creators", icon: User, endpoint: "/api/profile/search" },
  "!t": { type: "tags", label: "Tags", icon: Hash, endpoint: "/api/products/list" },
};

// Parse advanced search filters
const parseFilters = (query) => {
  const filters = { text: "", priceMin: null, priceMax: null };
  
  // Extract price filters: <500, >100, 100-500
  const priceLessThan = query.match(/<(\d+)/);
  const priceGreaterThan = query.match(/>(\d+)/);
  const priceRange = query.match(/(\d+)-(\d+)/);
  
  if (priceLessThan) {
    filters.priceMax = parseInt(priceLessThan[1]);
    query = query.replace(/<(\d+)/, '').trim();
  }
  
  if (priceGreaterThan) {
    filters.priceMin = parseInt(priceGreaterThan[1]);
    query = query.replace(/>(\d+)/, '').trim();
  }
  
  if (priceRange) {
    filters.priceMin = parseInt(priceRange[1]);
    filters.priceMax = parseInt(priceRange[2]);
    query = query.replace(/(\d+)-(\d+)/, '').trim();
  }
  
  filters.text = query.trim();
  return filters;
};

const initialState = { query: "", results: [], loading: false, selectedIndex: 0, activeBang: null };

export default function SpotlightSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const [state, setState] = useState(initialState);
  const { query, results, loading, selectedIndex, activeBang } = state;

  useEffect(() => {
    if (isOpen) {
      setState(initialState);
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else document.dispatchEvent(new CustomEvent("open-spotlight"));
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchResults = useCallback(async (searchQuery, bangType, filters) => {
    if (!searchQuery.trim() && !bangType) {
      setState(s => ({ ...s, results: [], loading: false }));
      return;
    }

    setState(s => ({ ...s, loading: true }));
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      if (bangType === "products" || !bangType) {
        // Build query params with price filters
        const params = new URLSearchParams({
          search: searchQuery,
          limit: '8'
        });
        
        if (filters.priceMin !== null) params.append('minPrice', filters.priceMin);
        if (filters.priceMax !== null) params.append('maxPrice', filters.priceMax);
        
        const res = await fetch(`${API_URL}/api/products/list?${params}`);
        const data = await res.json();
        
        // Client-side filtering if backend doesn't support price filters
        let products = data.products || [];
        if (filters.priceMin !== null) {
          products = products.filter(p => p.price >= filters.priceMin);
        }
        if (filters.priceMax !== null) {
          products = products.filter(p => p.price <= filters.priceMax);
        }
        
        setState(s => ({
          ...s,
          loading: false,
          results: products.map(p => ({
            type: "product",
            id: p.id,
            name: p.name,
            description: p.description?.slice(0, 80) || "",
            price: p.price,
            currency: p.currency,
            image: p.thumbnail_url,
          })),
        }));
      } else if (bangType === "creators") {
        const res = await fetch(
          `${API_URL}/api/profile/search?q=${encodeURIComponent(searchQuery)}&limit=8`
        );
        const data = await res.json();
        
        setState(s => ({
          ...s,
          loading: false,
          results: (data.profiles || []).map(p => ({
            type: "creator",
            id: p.user_id,
            name: p.display_name || p.username,
            username: p.username,
            description: p.bio?.slice(0, 80) || "",
            image: p.avatar_url,
          })),
        }));
      } else if (bangType === "tags") {
        const res = await fetch(
          `${API_URL}/api/products/list?tags=${encodeURIComponent(searchQuery)}&limit=8`
        );
        const data = await res.json();
        
        setState(s => ({
          ...s,
          loading: false,
          results: (data.products || []).map(p => ({
            type: "product",
            id: p.id,
            name: p.name,
            description: p.description?.slice(0, 80) || "",
            price: p.price,
            currency: p.currency,
            image: p.thumbnail_url,
          })),
        }));
      }
    } catch (err) {
      console.error("Search error:", err);
      setState(s => ({ ...s, loading: false, results: [] }));
    }
  }, []);

  useEffect(() => {
    let bangType = null;
    let searchQuery = query;

    // Check for bang commands
    for (const [bang, config] of Object.entries(BANGS)) {
      if (query.startsWith(bang + " ")) {
        bangType = config.type;
        searchQuery = query.slice(bang.length + 1).trim();
        if (activeBang !== bangType) {
          setState(s => ({ ...s, activeBang: bangType }));
        }
        break;
      }
    }

    if (!query.includes("!") && activeBang) {
      setState(s => ({ ...s, activeBang: null }));
      bangType = null;
    }

    // Parse filters for product searches
    const filters = bangType === "products" || !bangType ? parseFilters(searchQuery) : { text: searchQuery };
    searchQuery = filters.text;

    const timer = setTimeout(() => {
      fetchResults(searchQuery, bangType, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults, activeBang]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setState(s => ({ ...s, selectedIndex: Math.min(s.selectedIndex + 1, results.length - 1) }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setState(s => ({ ...s, selectedIndex: Math.max(s.selectedIndex - 1, 0) }));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim() && !query.startsWith("!")) {
        navigate(`/browse?search=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  const handleSelect = (item) => {
    if (item.type === "product") {
      navigate(`/product/${item.id}`);
    } else if (item.type === "creator") {
      navigate(`/profile/u/${item.username}`);
    }
    onClose();
  };

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0 && results.length > 0) {
      const selected = resultsRef.current.children[selectedIndex];
      selected?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, results]);

  if (!isOpen) return null;

  const showBangHints = !query || query === "!";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" 
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-md animate-backdrop-in" />
      
      <div 
        className="relative w-full max-w-2xl bg-white/80 backdrop-blur-3xl rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden animate-liquid-spotlight"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          backdropFilter: 'blur(60px) saturate(200%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%)',
        }}
      >
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200/50">
          <Search size={22} className="text-gray-400 flex-shrink-0 animate-search-pulse" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setState(s => ({ ...s, query: e.target.value, selectedIndex: 0 }))}
            onKeyDown={handleKeyDown}
            placeholder="Quick Search"
            className="flex-1 text-[20px] bg-transparent outline-none placeholder:text-gray-400 text-gray-900 font-medium"
            style={{ caretColor: '#3b82f6' }}
          />
          <kbd className="hidden sm:flex items-center justify-center min-w-[32px] h-8 px-2.5 text-xs font-semibold bg-white/70 text-gray-600 rounded-lg border border-gray-300/50 shadow-sm">
            ⎋
          </kbd>
        </div>

        {showBangHints && (
          <div className="px-6 py-5 animate-fade-in-up">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Commands
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {Object.entries(BANGS).map(([bang, config], idx) => {
                const Icon = config.icon;
                return (
                  <button
                    key={bang}
                    onClick={() => setState(s => ({ ...s, query: bang + " " }))}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-white/60 hover:bg-white/90 rounded-xl border border-gray-200/60 transition-all hover:shadow-sm group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <Icon size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" strokeWidth={2.5} />
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-gray-900">{bang}</div>
                      <div className="text-[10px] text-gray-500">{config.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Price Filters
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: "!p laptop <500", desc: "Less than ₹500" },
                { text: "!p mouse >100", desc: "Greater than ₹100" },
                { text: "!p phone 100-500", desc: "Range ₹100-₹500" },
                { text: "!c creator_name", desc: "Search creators" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-2 bg-white/40 rounded-xl border border-gray-200/60 animate-fade-in-up"
                  style={{ animationDelay: `${(idx + 3) * 50}ms` }}
                >
                  <div className="text-xs font-mono font-bold text-gray-900">{item.text}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="px-6 py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="max-h-[55vh] overflow-y-auto py-2" ref={resultsRef}>
            {results.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full px-5 py-3.5 flex items-center gap-4 text-left transition-all animate-fade-in-up ${
                  i === selectedIndex 
                    ? "bg-blue-500/10 border-l-2 border-blue-500" 
                    : "hover:bg-black/[0.04] border-l-2 border-transparent"
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">
                      {item.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-[15px]">
                    {item.name}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-500 truncate mt-0.5">
                      {item.description}
                    </div>
                  )}
                  {item.type === "creator" && item.username && (
                    <div className="text-xs text-gray-400 mt-0.5">@{item.username}</div>
                  )}
                </div>
                {item.type === "product" && item.price && (
                  <div className="text-sm font-bold text-gray-800 flex-shrink-0 bg-white/70 px-3 py-1.5 rounded-lg">
                    {item.currency === "INR" ? "₹" : "$"}{item.price}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {!loading && !results.length && query && !showBangHints && (
          <div className="px-6 py-12 text-center animate-fade-in-up">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-base font-medium text-gray-600">No results found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}