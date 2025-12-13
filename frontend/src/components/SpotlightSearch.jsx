import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity"];

const BANGS = [
  { bang: "!c", name: "Category", description: "Search in category", examples: ["!c design", "!c code"] },
  { bang: "!p", name: "Price", description: "Filter by max price", examples: ["!p 500", "!p 1000"] },
  { bang: "!s", name: "Seller", description: "Search sellers", examples: ["!s john", "!s studio"] },
  { bang: "!new", name: "New", description: "Show newest products", examples: ["!new templates"] },
  { bang: "!top", name: "Top Rated", description: "Show top rated", examples: ["!top", "!top code"] },
];

const initialState = { query: "", results: [], loading: false, selectedIndex: 0, showBangs: false };

export default function SpotlightSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const [state, setState] = useState(initialState);
  const { query, results, loading, selectedIndex, showBangs } = state;

  const parseBangs = useCallback((q) => {
    const parsed = { query: q, category: null, maxPrice: null, seller: false, sort: null };
    
    const categoryMatch = q.match(/!c\s+(\w+)/i);
    if (categoryMatch) {
      parsed.category = categoryMatch[1];
      parsed.query = q.replace(/!c\s+\w+/i, "").trim();
    }
    
    const priceMatch = q.match(/!p\s+(\d+)/i);
    if (priceMatch) {
      parsed.maxPrice = parseInt(priceMatch[1]);
      parsed.query = q.replace(/!p\s+\d+/i, "").trim();
    }
    
    if (q.includes("!s ")) {
      parsed.seller = true;
      parsed.query = q.replace(/!s\s+/i, "").trim();
    }
    
    if (q.includes("!new")) {
      parsed.sort = "newest";
      parsed.query = q.replace(/!new/i, "").trim();
    }
    
    if (q.includes("!top")) {
      parsed.sort = "rating";
      parsed.query = q.replace(/!top/i, "").trim();
    }
    
    return parsed;
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Handle opening - focus and reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState(initialState);
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!query.trim()) {
      setState(s => ({ ...s, results: [], showBangs: false }));
      return;
    }

    if (query === "!" || (query.startsWith("!") && !query.includes(" "))) {
      setState(s => ({ ...s, showBangs: true, results: [] }));
      return;
    }

    setState(s => ({ ...s, showBangs: false }));

    const parsed = parseBangs(query);
    const timer = setTimeout(async () => {
      setState(s => ({ ...s, loading: true }));
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        if (parsed.seller) {
          const res = await fetch(`${API_URL}/api/profile/search?q=${encodeURIComponent(parsed.query)}`);
          const data = await res.json();
          setState(s => ({
            ...s,
            loading: false,
            results: (data.profiles || []).slice(0, 5).map(p => ({
              type: "seller",
              id: p.id,
              name: p.display_name || p.name,
              description: p.bio || "Creator",
              image: p.profile_image_url,
            })),
          }));
        } else {
          let url = `${API_URL}/api/products/list?search=${encodeURIComponent(parsed.query)}`;
          if (parsed.category) url += `&category=${encodeURIComponent(parsed.category)}`;
          if (parsed.maxPrice) url += `&maxPrice=${parsed.maxPrice}`;
          if (parsed.sort) url += `&sort=${parsed.sort}`;
          
          const res = await fetch(url);
          const data = await res.json();
          setState(s => ({
            ...s,
            loading: false,
            results: (data.products || []).slice(0, 6).map(p => ({
              type: "product",
              id: p.id,
              name: p.name,
              description: p.description?.slice(0, 80) || "",
              price: p.price,
              currency: p.currency,
              category: p.category?.[0],
              image: p.thumbnail_url,
            })),
          }));
        }
      } catch {
        setState(s => ({ ...s, loading: false, results: [] }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, parseBangs]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleKeyDown = (e) => {
    const items = showBangs ? BANGS : results;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setState(s => ({ ...s, selectedIndex: Math.min(s.selectedIndex + 1, items.length - 1) }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setState(s => ({ ...s, selectedIndex: Math.max(s.selectedIndex - 1, 0) }));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showBangs && BANGS[selectedIndex]) {
        setState(s => ({ ...s, query: BANGS[selectedIndex].bang + " ", showBangs: false }));
      } else if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        const parsed = parseBangs(query);
        let url = `/browse?search=${encodeURIComponent(parsed.query)}`;
        if (parsed.category) url += `&category=${encodeURIComponent(parsed.category)}`;
        navigate(url);
        onClose();
      }
    }
  };

  const handleSelect = (item) => {
    if (item.type === "seller") {
      navigate(`/seller/${item.id}`);
    } else {
      navigate(`/product/${item.id}`);
    }
    onClose();
  };

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selected = resultsRef.current.children[selectedIndex];
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-2xl mx-4 bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] overflow-hidden animate-spotlight-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center border-b-3 border-black px-4">
          <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setState(s => ({ ...s, query: e.target.value, selectedIndex: 0 }))}
            onKeyDown={handleKeyDown}
            placeholder="Search products, sellers, categories... (Type ! for filters)"
            className="flex-1 py-5 text-lg font-medium bg-transparent outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-bold bg-gray-100 border-2 border-gray-300 rounded">
            <span>ESC</span>
          </kbd>
        </div>

        {showBangs && (
          <div className="max-h-80 overflow-y-auto" ref={resultsRef}>
            <div className="px-4 py-2 text-xs font-bold uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
              Search Bangs
            </div>
            {BANGS.map((bang, i) => (
              <button
                key={bang.bang}
                onClick={() => { setState(s => ({ ...s, query: bang.bang + " ", showBangs: false })); inputRef.current?.focus(); }}
                className={`w-full px-4 py-3 flex items-start gap-4 text-left transition-colors ${
                  i === selectedIndex ? "bg-[var(--yellow-400)]" : "hover:bg-gray-50"
                }`}
              >
                <span className="px-2 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">
                  {bang.bang}
                </span>
                <div className="flex-1">
                  <div className="font-bold">{bang.name}</div>
                  <div className="text-sm text-gray-500">{bang.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {bang.examples.join(" • ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!showBangs && query && (
          <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-4 py-2 text-xs font-bold uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                  {results[0]?.type === "seller" ? "Creators" : "Products"}
                </div>
                {results.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-colors ${
                      i === selectedIndex ? "bg-[var(--yellow-400)]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-[var(--pink-100)] border-2 border-black flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : item.type === "seller" ? (
                        <span className="text-xl font-bold">{item.name?.charAt(0)?.toUpperCase()}</span>
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{item.name}</div>
                      <div className="text-sm text-gray-500 truncate">{item.description}</div>
                    </div>
                    {item.type === "product" && (
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-[var(--pink-600)]">
                          {item.currency === "INR" ? "₹" : "$"}{item.price}
                        </span>
                        {item.category && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--mint)] border border-black font-bold uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-lg mb-2">No results found</div>
                <div className="text-sm text-gray-500 mb-4">
                  Try different keywords or use search filters with <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-bold">!</kbd>
                </div>
                <button
                  onClick={() => setState(s => ({ ...s, query: "!" }))}
                  className="px-4 py-2 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black hover:shadow-[2px_2px_0px_var(--black)] transition-all"
                >
                  View All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="px-4 py-6">
            <div className="text-xs font-bold uppercase text-gray-500 mb-3">Quick Access</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.slice(0, 4).map(cat => (
                <button
                  key={cat}
                  onClick={() => { navigate(`/browse?category=${cat}`); onClose(); }}
                  className="px-3 py-2 text-sm font-bold bg-gray-100 border-2 border-black hover:bg-[var(--yellow-400)] transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-[var(--pink-50)] border-2 border-[var(--pink-200)]">
              <div className="text-xs font-bold uppercase text-gray-700 mb-2">💡 Search Tips</div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[var(--pink-600)] flex-shrink-0">→</span>
                  <span>Type any product name, description, or #tag</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[var(--pink-600)] flex-shrink-0">→</span>
                  <span>Use <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-bold">!</kbd> for advanced filters</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[var(--pink-600)] flex-shrink-0">→</span>
                  <span>Try <span className="font-bold">!c design</span> or <span className="font-bold">!p 500</span> for quick filtering</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[var(--pink-600)] flex-shrink-0">→</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-bold">↵</kbd> to search all results</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="font-bold">Popular Bangs:</span>
              {BANGS.slice(0, 3).map(b => (
                <button 
                  key={b.bang} 
                  onClick={() => setState(s => ({ ...s, query: b.bang + " " }))}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 hover:bg-[var(--pink-100)] hover:border-[var(--pink-300)] transition-colors font-bold"
                >
                  {b.bang}
                </button>
              ))}
              <button 
                onClick={() => setState(s => ({ ...s, query: "!" }))}
                className="text-[var(--pink-600)] hover:text-[var(--pink-700)] font-bold"
              >
                view all →
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 bg-gray-50 border-t-3 border-black flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold">↵</kbd>
              select
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold">⌘K</kbd>
            to search
          </span>
        </div>
      </div>
    </div>
  );
}