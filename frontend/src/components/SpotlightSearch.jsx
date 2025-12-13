import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search01Icon } from "hugeicons-react";

const initialState = { query: "", results: [], loading: false, selectedIndex: 0 };

export default function SpotlightSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const [state, setState] = useState(initialState);
  const { query, results, loading, selectedIndex } = state;

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

  const fetchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setState(s => ({ ...s, results: [], loading: false }));
      return;
    }

    setState(s => ({ ...s, loading: true }));
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/products/list?search=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await res.json();
      
      setState(s => ({
        ...s,
        loading: false,
        results: (data.products || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description?.slice(0, 80) || "",
          price: p.price,
          currency: p.currency,
          image: p.thumbnail_url,
        })),
      }));
    } catch {
      setState(s => ({ ...s, loading: false, results: [] }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults]);

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
        navigate(`/product/${results[selectedIndex].id}`);
        onClose();
      } else if (query.trim()) {
        navigate(`/browse?search=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  const handleSelect = (item) => {
    navigate(`/product/${item.id}`);
    onClose();
  };

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0 && results.length > 0) {
      const selected = resultsRef.current.children[selectedIndex];
      selected?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, results]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" 
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-2xl bg-white/70 backdrop-blur-3xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <Search01Icon size={20} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setState(s => ({ ...s, query: e.target.value, selectedIndex: 0 }))}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 text-lg bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
            style={{ caretColor: '#3b82f6' }}
          />
          <kbd className="hidden sm:flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold bg-white/60 text-gray-500 rounded-md border border-gray-200/50">
            ⎋
          </kbd>
        </div>

        {(results.length > 0 || loading) && (
          <div className="border-t border-gray-200/50" />
        )}

        {loading ? (
          <div className="px-5 py-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="max-h-[50vh] overflow-y-auto py-1" ref={resultsRef}>
            {results.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all ${
                  i === selectedIndex 
                    ? "bg-blue-500/10" 
                    : "hover:bg-black/[0.03]"
                }`}
              >
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xl font-bold text-gray-400">
                      {item.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-500 truncate">{item.description}</div>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {item.currency === "INR" ? "₹" : "$"}{item.price}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
