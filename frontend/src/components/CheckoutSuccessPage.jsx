import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import { getPurchase, getPurchasesByOrder, getDownloadUrls } from "@/services/purchase.service";
import NavBar from "./NavBar";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { CheckCircle, Download, ArrowRight, Library, ShoppingBag, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState("idle"); // idle, preparing, downloading, completed, failed
  const downloadTriggered = useRef(false);

  const purchaseId = searchParams.get("purchase_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!purchaseId && !orderId) {
      setError("No purchase or order found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let results = [];
        if (orderId) {
          results = await getPurchasesByOrder(orderId);
        } else if (purchaseId) {
          const result = await getPurchase(purchaseId);
          results = [result];
        }
        
        if (!results || results.length === 0) {
          throw new Error("Purchase details not found");
        }

        setPurchases(results);
      } catch (err) {
        console.error("Failed to fetch purchase details:", err);
        setError(err.message || "Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, purchaseId, orderId]);

  // Auto-download logic
  useEffect(() => {
    if (purchases.length > 0 && downloadStatus === "idle" && !downloadTriggered.current) {
      handleAutoDownload();
    }
  }, [purchases, downloadStatus, handleAutoDownload]);

  const handleAutoDownload = async () => {
    if (downloadTriggered.current) return;
    downloadTriggered.current = true;
    
    setDownloadStatus("preparing");
    try {
      toast.success("Preparing your downloads...", { icon: "🚀" });
      
      for (const purchase of purchases) {
        try {
          const downloadData = await getDownloadUrls(purchase.id);
          const files = downloadData.files || [];
          
          for (const file of files) {
            // Trigger download
            const link = document.createElement("a");
            link.href = file.downloadUrl;
            link.download = file.fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads to prevent browser blocking
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } catch (err) {
          console.error(`Failed to download purchase ${purchase.id}:`, err);
        }
      }
      
      setDownloadStatus("completed");
      toast.success("Downloads started successfully!");
    } catch (err) {
      console.error("Auto-download failed:", err);
      setDownloadStatus("failed");
      toast.error("Auto-download failed. You can download manually below.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="pt-32 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <Loader2 className="w-16 h-16 text-[var(--pink-500)] animate-spin mb-6" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Verifying Payment</h2>
            <p className="text-gray-500 font-bold mt-2">Almost there, securing your assets...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-32 pb-12 max-w-2xl mx-auto px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] p-10 text-center"
          >
            <div className="w-20 h-20 bg-red-100 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-4xl font-black">!</span>
            </div>
            <h1 className="text-3xl font-black mb-4 uppercase italic tracking-tight">Something went wrong</h1>
            <p className="text-gray-600 mb-8 font-bold leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/library"
                className="px-8 py-4 bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_var(--black)] font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
              >
                <Library className="w-5 h-5" /> My Library
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-white text-black border-3 border-black shadow-[4px_4px_0px_var(--black)] font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const total = purchases.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const currency = purchases[0]?.currency || "INR";
  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Sparkles/Confetti Effect Mockup */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: "-10%", 
              left: `${Math.random() * 100}%`,
              rotate: 0,
              scale: 0 
            }}
            animate={{ 
              top: "110%",
              rotate: 360,
              scale: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className={`absolute w-4 h-4 rounded-sm border-2 border-black ${
              ["bg-[var(--pink-500)]", "bg-[var(--mint)]", "bg-[var(--yellow-400)]", "bg-blue-400"][i % 4]
            }`}
          />
        ))}
      </div>

      <main className="pt-28 pb-20 max-w-4xl mx-auto px-4 relative">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-4 border-black shadow-[12px_12px_0px_var(--black)] overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-[var(--mint)] border-b-4 border-black p-8 sm:p-12 text-center relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 bg-white border-4 border-black rounded-full mx-auto flex items-center justify-center mb-6 shadow-[6px_6px_0px_var(--black)] relative z-10"
            >
              <CheckCircle className="w-14 h-14 text-black" strokeWidth={2.5} />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl font-black uppercase italic mb-4 tracking-tighter relative z-10">
              PAYMENT <span className="text-white drop-shadow-[2px_2px_0px_black]">SUCCESS!</span>
            </h1>
            <p className="font-black text-xl sm:text-2xl uppercase tracking-tight max-w-md mx-auto relative z-10">
              Your assets have been delivered to your library.
            </p>

            {/* Background elements */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-20 rotate-180">
              <Sparkles className="w-24 h-24" />
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
              {/* Left Column: Purchased Items */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
                    <h3 className="font-black text-2xl uppercase italic flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6" /> Your Items
                    </h3>
                    <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase">
                      {purchases.length} Product{purchases.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {purchases.map((purchase, idx) => (
                        <motion.div 
                          key={purchase.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * idx }}
                          className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-3 border-black p-4 shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
                        >
                          <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="w-16 h-16 bg-[var(--pink-50)] border-2 border-black flex items-center justify-center shrink-0 overflow-hidden">
                              {purchase.products?.thumbnail_url ? (
                                <img src={purchase.products.thumbnail_url} className="w-full h-full object-cover" alt="" />
                              ) : <ShoppingBag className="w-8 h-8" />}
                            </div>
                            <div>
                              <p className="font-black text-lg line-clamp-1 group-hover:text-[var(--pink-500)] transition-colors">
                                {purchase.products?.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <Link 
                                  to={`/download/${purchase.id}`} 
                                  className="text-xs font-black uppercase text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" /> Manual Download
                                </Link>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">ID: {purchase.id.split('-')[0]}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right w-full sm:w-auto border-t-2 border-dashed border-gray-200 sm:border-0 pt-3 sm:pt-0">
                            <p className="font-black text-2xl tracking-tighter">
                              {currencySymbol}{parseFloat(purchase.amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Auto-download status bar */}
                <div className={`border-3 border-black p-6 flex flex-col sm:flex-row items-center gap-4 transition-colors ${
                  downloadStatus === "completed" ? "bg-[var(--mint)]" : 
                  downloadStatus === "failed" ? "bg-red-50" : "bg-blue-50"
                }`}>
                  <div className="bg-white border-2 border-black p-3 rounded-full shadow-[2px_2px_0px_black]">
                    {downloadStatus === "preparing" || downloadStatus === "downloading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : downloadStatus === "completed" ? (
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    ) : (
                      <Download className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-black uppercase text-sm tracking-widest text-gray-400">Download Status</p>
                    <p className="font-black text-lg uppercase italic">
                      {downloadStatus === "idle" && "Initializing downloads..."}
                      {downloadStatus === "preparing" && "Preparing your high-quality assets..."}
                      {downloadStatus === "downloading" && "Downloading files to your device..."}
                      {downloadStatus === "completed" && "All downloads triggered successfully!"}
                      {downloadStatus === "failed" && "Auto-download interrupted. Please use manual links."}
                    </p>
                  </div>
                  {downloadStatus === "failed" && (
                    <button 
                      onClick={() => { downloadTriggered.current = false; handleAutoDownload(); }}
                      className="px-4 py-2 bg-black text-white font-black text-xs uppercase border-2 border-black"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="space-y-6">
                <div className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_var(--pink-500)] relative overflow-hidden">
                  <h3 className="font-black text-2xl uppercase italic mb-6 border-b-2 border-white/20 pb-2">Summary</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center opacity-70">
                      <span className="font-bold uppercase text-sm">Subtotal</span>
                      <span className="font-black">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                      <span className="font-bold uppercase text-sm">Transaction Fee</span>
                      <span className="font-black">{currencySymbol}0.00</span>
                    </div>
                    <div className="border-t-2 border-dashed border-white/20 pt-4 flex justify-between items-center">
                      <span className="font-black uppercase text-xl italic">Total Paid</span>
                      <span className="font-black text-3xl text-[var(--pink-500)]">
                        {currencySymbol}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                    <p>Order ID: {orderId || 'N/A'}</p>
                    <p>Date: {new Date().toLocaleString()}</p>
                    <p>Status: VERIFIED & COMPLETED</p>
                  </div>

                  {/* Aesthetic design element */}
                  <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12">
                    <Library className="w-32 h-32" />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => navigate("/library")}
                    className="group w-full py-5 bg-[var(--yellow-400)] text-black border-4 border-black font-black text-xl uppercase italic shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_var(--black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-3"
                  >
                    <Library className="w-6 h-6" /> 
                    Open My Library
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/browse")}
                    className="w-full py-5 bg-white text-black border-4 border-black font-black text-xl uppercase italic shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_var(--black)] transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingBag className="w-6 h-6" /> Keep Browsing
                  </button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    Secured by 256-bit encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 font-bold mb-4">Having trouble with your purchase?</p>
          <div className="flex justify-center gap-8">
            <Link to="/help" className="text-sm font-black uppercase border-b-2 border-black hover:bg-black hover:text-white transition-colors">Help Center</Link>
            <Link to="/contact" className="text-sm font-black uppercase border-b-2 border-black hover:bg-black hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
