import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import NavBar from "./NavBar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const CATEGORIES = ["All", "Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity"];

// --- ICONS ---
const SearchIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const FireIcon = () => <svg className="w-5 h-5 fill-[var(--pink-500)] text-[var(--pink-500)]" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>;

export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlTag = searchParams.get("tag") || "";

  const [search, setSearch] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeTag, setActiveTag] = useState(urlTag);

  // Sync with URL params
  const searchParamsKey = `${urlSearch}-${urlCategory}-${urlTag}`;
  useEffect(() => {
    setSearch(urlSearch);
    setActiveCategory(urlCategory);
    setActiveTag(urlTag);
  }, [searchParamsKey]);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/list`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/featured`).then(res => res.json()),
    ]).then(([allData, featuredData]) => {
      setProducts(allData.products || []);
      setFeatured(featuredData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleTagClick = (tag, e) => {
    e?.stopPropagation();
    setActiveTag(tag);
    navigate(`/browse?tag=${encodeURIComponent(tag)}`);
  };

  const clearTag = () => {
    setActiveTag("");
    navigate("/browse");
  };

  const filtered = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "All" || 
        p.category?.some(c => c.toLowerCase().includes(activeCategory.toLowerCase()));
      const matchesTag = !activeTag || p.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase());
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating_avg || 0) - (a.rating_avg || 0);
      if (sortBy === "popularity") return (b.sales_count || 0) - (a.sales_count || 0);
      return 0;
    });

  const popularTags = [...new Set(products.flatMap(p => p.tags || []))].slice(0, 12);

  return (
    <div className="min-h-screen bg-[#f8f8f8] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          
          {/* --- HEADER HEADER --- */}
          <div className="relative mb-12 bg-black text-white p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_var(--pink-500)] overflow-hidden">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--yellow-400)] rounded-full mix-blend-exclusion filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
             
             <div className="relative z-10 max-w-3xl">
                <div className="inline-block px-4 py-1 bg-[var(--pink-500)] text-white font-black uppercase text-xs tracking-widest mb-4 border-2 border-white transform -rotate-2">
                    Marketplace
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                    Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--yellow-400)] to-[var(--pink-500)]">Digital</span> Assets
                </h1>
                <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl leading-relaxed">
                    Explore high-quality templates, code snippets, design assets, and more from India's best creators.
                </p>
             </div>
          </div>

          {/* --- FEATURED CAROUSEL --- */}
          {featured.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-[var(--yellow-400)] border-3 border-black"><FireIcon /></div>
                 <h2 className="text-2xl font-black uppercase tracking-tight">Featured Drops</h2>
              </div>
              
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="pb-12 px-2"
              >
                {featured.map((product) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard product={product} navigate={navigate} isFeatured={true} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* --- SIDEBAR FILTER (Sticky) --- */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_black]">
                <div className="bg-[var(--pink-100)] p-4 border-b-3 border-black flex items-center gap-2">
                    <FilterIcon />
                    <h3 className="font-black uppercase text-lg">Categories</h3>
                </div>
                <div className="p-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-all border-2 mb-2 last:mb-0 flex justify-between items-center group ${
                        activeCategory === cat
                          ? "bg-black text-white border-black"
                          : "bg-white border-transparent hover:border-black hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && <span className="text-[var(--yellow-400)]">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Cloud Sidebar */}
              {popularTags.length > 0 && (
                  <div className="mt-8">
                      <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-black"></span> Trending Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                          {popularTags.map(tag => (
                              <button 
                                key={tag} 
                                onClick={(e) => handleTagClick(tag, e)}
                                className="px-2 py-1 text-xs font-bold border-2 border-black bg-white hover:bg-[var(--yellow-400)] transition-colors"
                              >
                                  #{tag}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 w-full">
              
              {/* Search & Sort Bar */}
              <div className="bg-white border-3 border-black p-4 shadow-[6px_6px_0px_black] mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 font-bold bg-gray-50 border-3 border-black focus:outline-none focus:bg-[var(--yellow-50)] focus:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-all placeholder:text-gray-400 placeholder:font-medium"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <SearchIcon />
                  </div>
                </div>
                
                <div className="relative min-w-[200px]">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full h-full px-4 py-3 font-bold bg-white border-3 border-black cursor-pointer focus:outline-none focus:bg-gray-50 appearance-none"
                    >
                        <option value="newest">✨ Newest First</option>
                        <option value="price-low">💰 Price: Low to High</option>
                        <option value="price-high">💎 Price: High to Low</option>
                        <option value="rating">⭐ Highest Rated</option>
                        <option value="popularity">🔥 Most Popular</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 fill-black" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(activeTag || (activeCategory !== 'All' && window.innerWidth < 1024)) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {activeTag && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white font-bold text-sm border-2 border-black">
                            #{activeTag}
                            <button onClick={clearTag} className="hover:text-[var(--pink-500)] font-black text-lg leading-none">&times;</button>
                        </div>
                    )}
                    {/* Mobile Category Display */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 w-full">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 px-3 py-1 font-bold text-sm border-2 whitespace-nowrap ${
                                    activeCategory === cat ? "bg-[var(--pink-500)] text-white border-black" : "bg-white border-black"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {/* Product Grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border-3 border-black shadow-[4px_4px_0px_black] h-96 animate-pulse p-4">
                        <div className="bg-gray-200 h-48 mb-4 border-2 border-black/10"></div>
                        <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-16 text-center">
                  <div className="text-7xl mb-4 grayscale opacity-30">🕸️</div>
                  <h3 className="font-black text-2xl uppercase mb-2">No Results</h3>
                  <p className="text-gray-600 font-medium">Try adjusting your search or filters to find what you need.</p>
                  <button onClick={() => {setSearch(""); setActiveCategory("All"); setActiveTag("");}} className="mt-6 px-6 py-2 bg-[var(--yellow-400)] border-3 border-black font-bold uppercase hover:translate-x-1 hover:translate-y-1 transition-transform">
                      Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((product, i) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      navigate={navigate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- REUSABLE PRODUCT CARD COMPONENT ---
function ProductCard({ product, navigate, isFeatured }) {
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className={`group relative bg-white border-3 border-black cursor-pointer transition-all duration-200 flex flex-col h-full ${
        isFeatured 
        ? "shadow-[6px_6px_0px_var(--pink-500)] hover:shadow-[10px_10px_0px_var(--pink-500)] hover:-translate-y-1" 
        : "shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_black] hover:-translate-y-1"
      }`}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] bg-gray-100 border-b-3 border-black relative overflow-hidden">
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--pink-50)]">📦</div>
        )}

        {/* Floating Category Tag */}
        {product.category && product.category[0] && (
            <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-1 text-[10px] font-black uppercase bg-black text-white border border-white shadow-sm tracking-wider">
                    {product.category[0]}
                </span>
            </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-lg leading-tight mb-2 line-clamp-2 group-hover:text-[var(--pink-600)] transition-colors uppercase">
            {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 font-bold line-clamp-2 mb-4 flex-1">
            {product.description}
        </p>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex items-center justify-between">
          <div className="flex flex-col">
            {/* Price Tag Style */}
            <span className="inline-block bg-[var(--yellow-400)] text-black border-2 border-black px-2 py-0.5 text-base font-black transform -rotate-2 group-hover:rotate-0 transition-transform w-fit shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              {product.currency === 'INR' ? '₹' : '$'}{product.price}
            </span>
            
            {product.rating_count > 0 && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-500 uppercase">
                    <span className="text-yellow-500 text-sm">★</span> {product.rating_avg?.toFixed(1)} ({product.rating_count})
                </div>
            )}
          </div>

          <button className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full group-hover:bg-[var(--pink-500)] transition-colors border-2 border-black">
            <svg className="w-4 h-4 transform -rotate-45 group-hover:rotate-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}