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