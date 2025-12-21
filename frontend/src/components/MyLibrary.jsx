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
  Grid 
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
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-12 border-b-4 border-black pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[var(--mint)] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_black]">
                  Digital Library
                </span>
                {!loading && (
                   <span className="px-3 py-1 bg-black text-white border-2 border-black font-black text-xs uppercase">
                    {purchases.length} Items
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink-500)] to-[var(--yellow-500)]">Assets</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-bold mt-4 max-w-lg border-l-4 border-[var(--yellow-400)] pl-4">
                Access your purchased products, downloads, and licenses all in one place.
              </p>
            </motion.div>

            {/* SEARCH BAR */}
            <div className="w-full lg:w-96">
              <div className="relative group">
                <div className="absolute -inset-1 bg-black rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-3 border-black font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 transition-all shadow-[4px_4px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_black]"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SECTION */}
        {loading ? (
          // LOADING SKELETON
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 border-2 border-black mb-4" />
                <div className="h-8 bg-gray-200 w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 w-1/2 mb-6" />
                <div className="h-12 bg-gray-200 w-full" />
              </div>
            ))}
          </div>
        ) : filteredPurchases.length === 0 ? (
          // EMPTY STATE
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gray-50 border-4 border-black border-dashed rounded-xl"
          >
            <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_black]">
              <Package className="w-10 h-10 text-[var(--pink-500)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase italic text-center">
              {searchQuery ? "No matches found" : "Library Empty"}
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-md text-center font-bold px-4">
              {searchQuery 
                ? `We couldn't find anything matching "${searchQuery}".` 
                : "You haven't purchased any digital assets yet. Time to go shopping!"}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-200 bg-black border-4 border-transparent hover:bg-white hover:text-black hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              <span className="uppercase tracking-widest">Browse Store</span>
              <div className="absolute -inset-3 rounded-xl border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </button>
          </motion.div>
        ) : (
          // GRID OF CARDS
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPurchases.map((purchase, idx) => (
                <motion.div
                  key={purchase.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--black)] transition-all flex flex-col h-full"
                >
                  {/* Card Image */}
                  <div className="aspect-video bg-[var(--pink-50)] border-b-4 border-black relative overflow-hidden shrink-0 group">
                    {purchase.products?.thumbnail_url ? (
                      <>
                        <img 
                          src={purchase.products.thumbnail_url} 
                          alt={purchase.products?.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                         {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-300">
                        <Package className="w-16 h-16 mb-2" />
                        <span className="font-bold text-sm uppercase">No Preview</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="bg-[var(--yellow-400)] text-black border-2 border-black px-2 py-1 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_black]">
                        Owned
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 
                        className="font-black text-2xl mb-2 line-clamp-1 cursor-pointer hover:underline decoration-4 underline-offset-2 decoration-[var(--pink-500)]"
                        onClick={() => navigate(`/product/${purchase.product_id}`)}
                      >
                        {purchase.products?.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6">
                        <Clock className="w-4 h-4" />
                        <span>
                          Purchased: {new Date(purchase.purchased_at || purchase.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 mt-auto">
                      <button
                        onClick={() => navigate(`/download/${purchase.id}`)}
                        className="w-full py-3 font-black uppercase text-sm bg-[var(--mint)] border-3 border-black shadow-[3px_3px_0px_black] hover:bg-[var(--mint)] hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" /> Download Assets
                      </button>
                      
                      <button
                        onClick={() => navigate(`/product/${purchase.product_id}`)}
                        className="w-full py-3 font-black uppercase text-sm bg-white border-3 border-black text-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                         View Details <ExternalLink className="w-4 h-4" />
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