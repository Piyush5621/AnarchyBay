import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { getMyPurchases } from "@/services/purchase.service";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Download, ExternalLink, ShoppingBag, Library, Search, Loader2, Package } from "lucide-react";

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

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <span className="inline-block px-4 py-2 bg-[var(--mint)] border-3 border-black font-black text-sm uppercase mb-4 shadow-[4px_4px_0px_black]">
                Library
              </span>
              <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter">
                YOUR <span className="text-[var(--pink-500)]">ASSETS</span>
              </h1>
              <p className="text-xl text-gray-500 font-bold mt-2">Manage and download your purchased collections.</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-3 border-black shadow-[4px_4px_0px_black] font-bold focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_black] transition-all outline-none"
              />
            </div>
          </motion.div>
        </header>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] p-4 animate-pulse">
                <div className="aspect-video bg-gray-100 border-2 border-black mb-4" />
                <div className="h-6 bg-gray-100 w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredPurchases.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-4 border-black shadow-[12px_12px_0px_var(--black)] p-16 text-center"
          >
            <div className="w-24 h-24 bg-[var(--pink-50)] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_black]">
              <Package className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-black mb-4 uppercase italic">No Assets Found</h2>
            <p className="text-xl text-gray-500 mb-10 max-w-md mx-auto font-bold">
              {searchQuery ? `No results for "${searchQuery}"` : "Your library is empty. Start your collection today!"}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="px-10 py-5 font-black text-xl uppercase italic bg-[var(--pink-500)] text-white border-4 border-black shadow-[8px_8px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[11px_11px_0px_var(--black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <ShoppingBag className="w-6 h-6" /> Explore Marketplace
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPurchases.map((purchase, idx) => (
                <motion.div
                  key={purchase.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--black)] transition-all overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-[var(--pink-50)] border-b-4 border-black relative overflow-hidden shrink-0">
                    {purchase.products?.thumbnail_url ? (
                      <img 
                        src={purchase.products.thumbnail_url} 
                        alt={purchase.products?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        <Package className="w-20 h-20 text-black/10" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-black text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_var(--pink-500)]">
                        Purchased
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-black text-2xl mb-2 line-clamp-1 group-hover:text-[var(--pink-500)] transition-colors">
                        {purchase.products?.name}
                      </h3>
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">
                        Acquired on {new Date(purchase.purchased_at || purchase.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4 mt-auto border-t-2 border-dashed border-gray-100">
                      <button
                        onClick={() => navigate(`/download/${purchase.id}`)}
                        className="flex-1 py-4 font-black uppercase italic bg-[var(--mint)] border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" /> Download
                      </button>
                      <button
                        onClick={() => navigate(`/product/${purchase.product_id}`)}
                        className="p-4 font-black border-3 border-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="View Product Page"
                      >
                        <ExternalLink className="w-5 h-5" />
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
