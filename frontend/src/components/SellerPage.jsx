import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

export default function SellerPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profile/user/${sellerId}`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profile/user/${sellerId}/products`).then(res => res.json()),
    ]).then(([profileData, productsData]) => {
      setSeller(profileData.profile);
      setProducts(productsData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sellerId]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return (b.rating_avg || 0) - (a.rating_avg || 0);
    if (sortBy === "popularity") return (b.sales_count || 0) - (a.sales_count || 0);
    return 0;
  });

  // --- CUSTOM SKELETON LOADER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] rounded-xl" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border-4 border-black h-96 shadow-[4px_4px_0px_black]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (!seller) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-12 text-center max-w-lg w-full">
            <div className="text-7xl mb-6 grayscale opacity-50">👻</div>
            <h1 className="text-4xl font-black mb-2 uppercase italic">Ghost Town</h1>
            <p className="text-gray-600 font-bold mb-8">We couldn't find the seller you are looking for.</p>
            <button
              onClick={() => navigate("/browse")}
              className="w-full py-4 font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all"
            >
              Back to Browse
            </button>
          </div>
        </main>
      </div>
    );
  }

  const displayName = seller.display_name || seller.name || "Anonymous";

  return (
    // Background pattern for texture
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <NavBar />

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 group flex items-center gap-2 font-black text-sm uppercase tracking-wider hover:text-[var(--pink-600)] transition-colors w-fit"
          >
            <div className="bg-white border-2 border-black p-1 group-hover:-translate-x-1 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            Back
          </button>

          {/* SELLER PROFILE HEADER */}
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_black] mb-16 overflow-hidden group">
            
            {/* Decorative Banner Header */}
            <div className="h-32 bg-[var(--pink-500)] border-b-4 border-black bg-[image:radial-gradient(circle,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
            
            <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-12 md:-mt-16">
                {/* Avatar */}
                <div className="relative z-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-black flex items-center justify-center text-5xl font-black overflow-hidden shadow-lg">
                        {seller.profile_image_url ? (
                        <img src={seller.profile_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                        <span className="text-gray-800">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    {/* Status Dot */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-black rounded-full" title="Active Seller"></div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left mb-2 w-full">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-1">
                        {displayName}
                    </h1>
                    {seller.username && (
                        <p className="text-white bg-black w-fit p-1 border-0 rounded-2xl font-bold text-lg mb-3">@{seller.username}</p>
                    )}
                    
                    {seller.bio && (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-3 mb-4 inline-block md:block rounded-lg max-w-2xl">
                             <p className="text-gray-700 font-medium leading-relaxed">"{seller.bio}"</p>
                        </div>
                    )}

                    {/* Social Links */}
                    {seller.social_links && Object.keys(seller.social_links).filter(key => seller.social_links[key]).length > 0 && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3 flex-wrap">
                            {seller.social_links.instagram && (
                                <a href={seller.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="Instagram">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.twitter && (
                                <a href={seller.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="Twitter">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.github && (
                                <a href={seller.social_links.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#181717] text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="GitHub">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.linkedin && (
                                <a href={seller.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="LinkedIn">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.youtube && (
                                <a href={seller.social_links.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#FF0000] text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="YouTube">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.facebook && (
                                <a href={seller.social_links.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.tiktok && (
                                <a href={seller.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="TikTok">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </svg>
                                </a>
                            )}
                            {seller.social_links.website && (
                                <a href={seller.social_links.website} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#6366F1] text-white rounded-full hover:scale-110 transition-transform border-2 border-black" title="Website">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Badges */}
                <div className="flex flex-wrap justify-center gap-3 mb-2">
                    <div className="px-4 py-2 bg-[var(--yellow-100)] border-3 border-black font-bold uppercase text-xs shadow-[2px_2px_0px_black]">
                        📦 {products.length} Products
                    </div>
                    <div className="px-4 py-2 bg-[var(--mint)] border-3 border-black font-bold uppercase text-xs shadow-[2px_2px_0px_black]">
                        📅 Joined {new Date(seller.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                </div>
            </div>
          </div>

          {/* FILTERS & TITLE */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b-4 border-black pb-4">
            <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                 Marketplace <span className="bg-black text-white px-2 text-lg rounded-sm transform -rotate-2 inline-block">Items</span>
            </h2>
            
            <div className="relative group">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-none"></div>
                <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="relative z-10 w-full md:w-64 px-4 py-3 font-bold bg-white border-3 border-black cursor-pointer focus:outline-none focus:ring-4 focus:ring-[var(--pink-200)] uppercase text-sm appearance-none"
                style={{ backgroundImage: 'none' }} // Remove default arrow to add custom one if wanted, or keep default
                >
                <option value="newest">✨ Newest Arrivals</option>
                <option value="oldest">🕰️ Oldest Items</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="popularity">🔥 Most Popular</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <svg className="w-5 h-5 border-2 border-black bg-[var(--yellow-400)] rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white border-4 border-black border-dashed p-16 text-center">
              <div className="text-6xl mb-4 opacity-50">📭</div>
              <h3 className="font-black text-2xl uppercase mb-2">Shelf Empty</h3>
              <p className="text-gray-500 font-bold">This seller hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- ENHANCED PRODUCT CARD ---
function ProductCard({ product, navigate }) {
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] bg-gray-100 border-b-4 border-black relative overflow-hidden">
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
                <span className="px-3 py-1 text-xs font-black uppercase bg-black text-white border-2 border-white shadow-sm">
                    {product.category[0]}
                </span>
            </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-xl leading-tight mb-2 line-clamp-2 group-hover:text-[var(--pink-600)] transition-colors">
            {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4 flex-1">
            {product.description}
        </p>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex items-center justify-between">
          <div className="flex flex-col">
            {/* Price Tag Style */}
            <span className="inline-block bg-[var(--yellow-400)] text-black border-2 border-black px-2 py-0.5 text-lg font-black transform -rotate-2 group-hover:rotate-0 transition-transform w-fit">
              {product.currency === 'INR' ? '₹' : '$'}{product.price}
            </span>
            
            {product.rating_count > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-500">
                    <span className="text-yellow-500 text-sm">★</span> {product.rating_avg?.toFixed(1)} ({product.rating_count})
                </div>
            )}
          </div>

          <button className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full group-hover:bg-[var(--pink-500)] transition-colors">
            <svg className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
