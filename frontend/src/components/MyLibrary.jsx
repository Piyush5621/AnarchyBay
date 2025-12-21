import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { getMyPurchases } from "@/services/purchase.service";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  ExternalLink, 
  ShoppingBag, 
  Search, 
  Package, 
  Clock, 
  FileCheck,
  ShieldCheck
} from "lucide-react";

export default function MyLibrary() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getMyPurchases();
        setPurchases(response.purchases || []);
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const filteredPurchases = purchases.filter(p => 
    p.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Textured Background
    <div className="min-h-screen bg-[#f4f4f5] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      <NavBar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <header className="mb-12">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-8 md:p-10 relative overflow-hidden">
            {/* Decorative Background Icon */}
            <FileCheck className="absolute -right-6 -bottom-6 w-64 h-64 text-gray-100 transform rotate-12 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[var(--mint)] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_black] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Licensed Assets
                  </span>
                  {!loading && (
                    <span className="px-3 py-1 bg-black text-white border-2 border-black font-black text-xs uppercase">
                      {purchases.length} Items
                    </span>
                  )}
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">
                  My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink-500)] to-[var(--yellow-500)]">Stash</span>
                </h1>
                <p className="text-lg font-bold text-gray-600 max-w-md">
                  Manage your downloads, licenses, and purchased content.
                </p>
              </div>

              {/* SEARCH BAR */}
              <div className="w-full lg:w-96">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border-3 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--pink-500)] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- CONTENT GRID --- */}
        {loading ? (
          // LOADING STATE
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-3 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-0 h-96 animate-pulse flex flex-col">
                <div className="h-48 bg-gray-200 border-b-3 border-black" />
                <div className="p-6 space-y-4 flex-1">
                  <div className="h-8 bg-gray-200 w-3/4" />
                  <div className="h-4 bg-gray-200 w-1/2" />
                  <div className="mt-auto h-12 bg-gray-200 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPurchases.length === 0 ? (
          // EMPTY STATE
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white border-3 border-black border-dashed shadow-[4px_4px_0px_rgba(0,0,0,0.05)]"
          >
            <div className="w-24 h-24 bg-[var(--pink-100)] border-3 border-black rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <Package className="w-10 h-10 text-[var(--pink-600)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase italic text-center">
              {searchQuery ? "Ghost Town" : "Library Empty"}
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-md text-center font-bold">
              {searchQuery 
                ? `No assets found matching "${searchQuery}".` 
                : "You haven't purchased anything yet. Your digital empire starts with one click!"}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="px-8 py-4 font-black text-white bg-black border-3 border-black uppercase tracking-wider hover:bg-[var(--pink-500)] hover:border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_black] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" /> Browse Market
            </button>
          </motion.div>
        ) : (
          // ASSETS GRID
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPurchases.map((purchase, idx) => (
                <motion.div
                  key={purchase.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white border-3 border-black shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all flex flex-col h-full overflow-hidden"
                >
                  {/* Card Image */}
                  <div className="aspect-[4/3] bg-gray-100 border-b-3 border-black relative overflow-hidden shrink-0">
                    {purchase.products?.thumbnail_url ? (
                      <>
                        <img 
                          src={purchase.products.thumbnail_url} 
                          alt={purchase.products?.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--yellow-50)] text-gray-300">
                        <Package className="w-16 h-16 mb-2 text-[var(--yellow-400)]" />
                        <span className="font-black text-xs uppercase text-black/20">No Preview</span>
                      </div>
                    )}
                    
                    {/* Floating Sticker */}
                    <div className="absolute top-3 right-3 transform rotate-3 group-hover:rotate-6 transition-transform">
                      <span className="bg-[var(--mint)] text-black border-2 border-black px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_black]">
                        Owned
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col relative bg-white">
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 
                          className="font-black text-xl leading-tight line-clamp-2 cursor-pointer hover:underline decoration-2 underline-offset-2"
                          onClick={() => navigate(`/product/${purchase.product_id}`)}
                        >
                          {purchase.products?.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6 bg-gray-100 w-fit px-2 py-1 rounded border border-gray-200">
                        <Clock className="w-3 h-3" />
                        <span>
                          Bought {new Date(purchase.purchased_at || purchase.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-5 gap-3 mt-auto">
                      <button
                        onClick={() => navigate(`/download/${purchase.id}`)}
                        className="col-span-3 py-3 font-black uppercase text-xs bg-[var(--mint)] border-2 border-black shadow-[2px_2px_0px_black] hover:bg-[var(--mint)] hover:brightness-110 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2"
                        title="Download Files"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      
                      <button
                        onClick={() => navigate(`/product/${purchase.product_id}`)}
                        className="col-span-2 py-3 font-bold uppercase text-xs bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1"
                        title="View Details"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}