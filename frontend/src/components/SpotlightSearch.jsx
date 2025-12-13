import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search01Icon, 
  ShoppingBasket01Icon,
  UserIcon,
  Tag01Icon,
  DollarCircleIcon,
  SparklesIcon,
  AnalyticsUpIcon
} from "hugeicons-react";

const FILTERS = [
  { id: "products", label: "Products", icon: ShoppingBasket01Icon },
  { id: "creators", label: "Creators", icon: UserIcon },
  { id: "category", label: "Categories", icon: Tag01Icon },
  { id: "price", label: "Price", icon: DollarCircleIcon },
  { id: "new", label: "New", icon: SparklesIcon },
  { id: "top", label: "Top", icon: AnalyticsUpIcon },
];

const initialState = { query: "", results: [], loading: false, selectedIndex: 0, activeFilter: null };

export default function SpotlightSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const [state, setState] = useState(initialState);
  const { query, results, loading, selectedIndex, activeFilter } = state;

  /* eslint-disable react-hooks/set-state-in-effect */
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

  const fetchResults = useCallback(async (searchQuery, filter) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      if (filter === "creators") {
        const res = await fetch(`${API_URL}/api/profile/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await res.json();
        setState(s => ({
          ...s,
          loading: false,
          results: (data.profiles || []).map(p => ({
            type: "seller",
            id: p.id,
            name: p.display_name || p.name,
            description: p.bio || "Creator",
            image: p.profile_image_url,
          })),
        }));
      } else if (filter === "category") {
        const categories = ["Design", "Development", "Marketing", "Business", "Templates", "E-commerce", "Education", "Music", "Video"];
        setState(s => ({
          ...s,
          loading: false,
          results: categories
            .filter(cat => !searchQuery || cat.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(cat => ({
              type: "category",
              id: cat,
              name: cat,
              description: `Browse ${cat} products`,
            })),
        }));
      } else if (filter === "price") {
        const priceRanges = [
          { id: "0-500", name: "Under ₹500", description: "Budget-friendly products", maxPrice: 500 },
          { id: "500-1000", name: "₹500 - ₹1000", description: "Mid-range products", minPrice: 500, maxPrice: 1000 },
          { id: "1000-2500", name: "₹1000 - ₹2500", description: "Premium products", minPrice: 1000, maxPrice: 2500 },
          { id: "2500+", name: "Above ₹2500", description: "High-end products", minPrice: 2500 },
        ];
        setState(s => ({
          ...s,
          loading: false,
          results: priceRanges.map(range => ({
            type: "price",
            ...range,
          })),
        }));
      } else {
        let url = `${API_URL}/api/products/list?limit=12`;
        const params = new URLSearchParams();
        
        if (searchQuery) params.append("search", searchQuery);
        if (filter === "new") params.append("sort", "newest");
        if (filter === "top") params.append("sort", "rating");
        
        const queryString = params.toString();
        if (queryString) url += `&${queryString}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setState(s => ({
          ...s,
          loading: false,
          results: (data.products || []).map(p => ({
            type: "product",
            id: p.id,
            name: p.name,
            description: p.description?.slice(0, 100) || "",
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
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!activeFilter) return;
    
    const timer = setTimeout(() => {
      fetchResults(query, activeFilter);
    }, query ? 300 : 0);

    return () => clearTimeout(timer);
  }, [query, activeFilter, fetchResults]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      } else if (query.trim() && activeFilter === "products") {
        navigate(`/browse?search=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  const handleSelect = (item) => {
    if (item.type === "seller") {
      navigate(`/seller/${item.id}`);
    } else if (item.type === "category") {
      navigate(`/browse?category=${encodeURIComponent(item.id)}`);
    } else if (item.type === "price") {
      let url = "/browse?";
      if (item.minPrice) url += `minPrice=${item.minPrice}&`;
      if (item.maxPrice) url += `maxPrice=${item.maxPrice}`;
      navigate(url);
    } else {
      navigate(`/product/${item.id}`);
    }
    onClose();
  };

  const handleFilterClick = (filter) => {
    setState(s => ({ ...s, activeFilter: filter.id, selectedIndex: 0, results: [] }));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selected = resultsRef.current.children[selectedIndex];
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const showSuggestion = activeFilter && results.length === 0 && !loading;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" />
      
      <div 
        className="relative w-full max-w-4xl bg-white/98 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden animate-spotlight-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-6 py-5 border-b border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setState(s => ({ ...s, query: e.target.value, selectedIndex: 0 }))}
            onKeyDown={handleKeyDown}
            placeholder={activeFilter ? `Search in ${FILTERS.find(f => f.id === activeFilter)?.label || "results"}...` : "Spotlight Search"}
            className="flex-1 text-xl font-medium bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
          />
          <kbd className="hidden sm:flex items-center justify-center w-8 h-8 text-xs font-bold bg-gray-100 text-gray-500 rounded-lg shadow-sm">
            ⎋
          </kbd>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
                  isActive 
                    ? "bg-blue-500 text-white shadow-lg scale-105" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {!activeFilter && (
          <div className="px-6 py-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-base text-gray-500">Select a filter to start browsing</p>
          </div>
        )}

        {activeFilter && (
          <div className="max-h-[60vh] overflow-y-auto" ref={resultsRef}>
            {loading ? (
              <div className="px-6 py-16 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full px-6 py-5 flex items-center gap-4 text-left transition-all ${
                      i === selectedIndex 
                        ? "bg-blue-50 border-l-4 border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : item.type === "seller" ? (
                        <span className="text-2xl font-black text-gray-600">
                          {item.name?.charAt(0)?.toUpperCase()}
                        </span>
                      ) : item.type === "category" ? (
                        <Tag01Icon size={28} className="text-gray-400" strokeWidth={2} />
                      ) : item.type === "price" ? (
                        <DollarCircleIcon size={28} className="text-gray-400" strokeWidth={2} />
                      ) : (
                        <ShoppingBasket01Icon size={28} className="text-gray-400" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-lg">{item.name}</div>
                      <div className="text-sm text-gray-500 truncate mt-1">{item.description}</div>
                    </div>
                    {item.type === "product" && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          {item.currency === "INR" ? "₹" : "$"}{item.price}
                        </span>
                        {item.category && (
                          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md font-bold uppercase tracking-wide">
                            {item.category}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : showSuggestion ? (
              <div className="px-6 py-12 text-center">
                <div className="text-5xl mb-4">💡</div>
                <div className="font-semibold text-xl mb-2 text-gray-900">No results found</div>
                <p className="text-sm text-gray-500 mb-6">
                  Try another filter or search term
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}