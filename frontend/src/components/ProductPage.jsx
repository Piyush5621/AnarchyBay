import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { useRazorpay } from "react-razorpay";

const COMMENT_CHAR_LIMIT = 500;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- ICONS ---
const Icons = {
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Star: ({ filled, half }) => (
    <svg className={`w-5 h-5 ${filled ? "fill-[var(--yellow-400)] text-black" : "fill-gray-200 text-gray-400"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  Share: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>,
  Heart: ({ filled }) => <svg className={`w-5 h-5 ${filled ? "fill-red-500 text-red-500" : "text-black"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  Play: () => <svg className="w-12 h-12 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
};

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/^### (.+)$/gm, "<h3 class='text-xl font-black uppercase mt-6 mb-3 tracking-tight'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-black uppercase mt-8 mb-4 tracking-tight border-b-2 border-black pb-2'>$2</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-3xl font-black uppercase mt-8 mb-4 tracking-tight'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='font-black bg-yellow-200 px-1'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em class='italic font-serif'>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-1.5 py-0.5 bg-gray-100 border border-black rounded text-sm font-mono text-[var(--pink-600)]'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc marker:text-black mb-1'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class='ml-4 list-decimal marker:font-bold mb-1'>$2</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-[var(--pink-600)] underline decoration-2 font-bold hover:bg-black hover:text-white transition-colors px-1' target='_blank' rel='noopener'>$1</a>")
    .replace(/\n\n/g, "</p><p class='mb-4 leading-relaxed'>")
    .replace(/\n/g, "<br/>");
  return `<p class='mb-4 leading-relaxed'>${html}</p>`;
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [checkingPurchase, setCheckingPurchase] = useState(true); // eslint-disable-line
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]); // eslint-disable-line
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0, distribution: {} });
  const [userReview, setUserReview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showDetailedPreview, setShowDetailedPreview] = useState(false);

  const { Razorpay } = useRazorpay();

  // --- LOGIC: Fetch Data & Check Status ---
  useEffect(() => {
    const checkUserPurchase = async () => {
      if (isAuthenticated && productId) {
        try {
          const token = getAccessToken();
          const res = await fetch(`${API_URL}/api/purchases/check/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.hasPurchased) {
            setHasPurchased(true);
            setPurchaseData(data.purchase);
          }
        } catch (err) {
          console.error("Error checking purchase:", err);
        } finally {
          setCheckingPurchase(false);
        }
      } else {
        setCheckingPurchase(false);
      }
    };
    
    checkUserPurchase();
  }, [productId, isAuthenticated]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
      const res = await fetch(`${API_URL}/api/products/${productId}`);
      const data = await res.json();
      setProduct(data.product || data);
      
      const variantsRes = await fetch(`${API_URL}/api/products/${productId}/variants`);
        const variantsData = await variantsRes.json();
        setVariants(variantsData);
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }

        // Load Reviews initially
        const reviewsRes = await fetch(`${API_URL}/api/reviews/product/${productId}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setReviewStats(reviewsData.stats || { avg: 0, count: 0, distribution: {} });
        
        if (isAuthenticated) {
            // Check if user already reviewed (logic depends on backend, simplified here)
            // Ideally backend sends a flag or we filter frontend
        }

      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated]);

  // --- HANDLERS ---
  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (hasPurchased) { navigate(`/download/${purchaseData.id}`); return; }

    setBuying(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/purchases/checkout/razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, variantId: selectedVariant?.id }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Anarchy Bay",
        description: `Purchase of ${product.name}`,
        image: "/favicon_io/android-chrome-512x512.png",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/purchases/verify/razorpay`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              toast.success("Payment successful!");
              navigate(`/checkout/success?purchase_id=${verifyData.purchase.id}`);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error verifying payment");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#000000" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setBuying(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) { toast.error("Please login first"); navigate("/login"); return; }
    try {
      const token = getAccessToken();
      if (inWishlist) {
        await fetch(`${API_URL}/api/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
        setInWishlist(true);
        toast.success("Added to wishlist!");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please login first"); navigate("/login"); return; }
    try {
      const token = getAccessToken();
      if (inCart) {
        await fetch(`${API_URL}/api/cart/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setInCart(false);
        toast.success("Removed from cart");
      } else {
        await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
        setInCart(true);
        toast.success("Added to cart!");
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login to review"); navigate("/login"); return; }
    if (newReview.comment.length > COMMENT_CHAR_LIMIT) { toast.error(`Comment must be under ${COMMENT_CHAR_LIMIT} chars`); return; }
    setSubmittingReview(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      
      toast.success("Review submitted!");
      setNewReview({ rating: 5, comment: "" });
      
      // Refresh reviews
      const reviewsRes = await fetch(`${API_URL}/api/reviews/product/${productId}`);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews || []);
      setReviewStats(reviewsData.stats || { avg: 0, count: 0, distribution: {} });
      setUserReview(reviewsData.reviews?.find((r) => r.user_id === user?.id) || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product?.name} on AnarchyBay!`;
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } else {
      window.open(links[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  // --- RENDER LOADERS ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_black] aspect-video animate-pulse" />
              <div className="h-12 bg-gray-200 border-[3px] border-black w-3/4 animate-pulse" />
              <div className="h-40 bg-white border-[3px] border-black shadow-[6px_6px_0px_black] animate-pulse" />
            </div>
            <div className="h-96 bg-white border-[3px] border-black shadow-[6px_6px_0px_black] animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-32 pb-20 flex justify-center">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_black] p-12 text-center max-w-lg">
            <div className="text-6xl mb-4 grayscale opacity-50">🔍</div>
            <h1 className="font-black text-3xl mb-4 uppercase">Product Not Found</h1>
            <button onClick={() => navigate("/browse")} className="px-8 py-3 font-bold uppercase border-[3px] border-black bg-[var(--yellow-400)] shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all">
              Back to Browse
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- PRODUCT DATA ---
  const currencySymbol = product.currency === "INR" ? "₹" : "$";
  const creatorName = product.creator?.display_name || product.creator?.name || "Anonymous";
  const shortDesc = product.short_description || product.description?.slice(0, 200) || "";
  const longDesc = product.long_description || product.description || "";
  const coverImage = product.thumbnail_url || product.image_url?.[0];
  const pageColor = product.page_color || "#f3f4f6"; // Default slightly gray if null
  const accentColor = product.accent_color || "#ffde59";
  const buttonColor = product.button_color || "#ec4899";
  const textColor = product.text_color || "#000000";
  const isCreator = user?.id === product.creator_id;

  return (
    // Dynamic background color from seller settings, with pattern overlay
    <div className="min-h-screen relative" style={{ backgroundColor: pageColor }}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <NavBar />

      <main className="pt-24 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Top Actions: Back & Edit */}
          <div className="flex justify-between items-center mb-6">
             <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 font-black text-sm uppercase bg-white border-[3px] border-black px-4 py-2 shadow-[4px_4px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] transition-all"
             >
                <Icons.Back /> Back
             </button>

            {isCreator && (
              <button
                onClick={() => navigate(`/edit-product/${productId}`)}
                className="px-5 py-2 text-sm font-bold uppercase bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Icons.Edit /> Edit Product
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN (Images & Details) ================= */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* --- HERO IMAGE CARD --- */}
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_black] overflow-hidden relative group">
                {coverImage ? (
                  <div className="relative bg-gray-100 aspect-video flex items-center justify-center overflow-hidden">
                    <img src={coverImage} alt={product.name} className="w-full h-full object-contain" />
                    
                    {/* Tags Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {product.category?.map((cat, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-black uppercase bg-[var(--mint)] border-2 border-black shadow-sm">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* View Details Button */}
                    {(product.preview_images?.length > 0 || product.preview_videos?.length > 0) && (
                      <button
                        onClick={() => setShowDetailedPreview(true)}
                        className="absolute bottom-4 right-4 px-6 py-2 bg-black text-white font-bold uppercase border-2 border-white shadow-[4px_4px_0px_black] hover:scale-105 transition-transform flex items-center gap-2"
                      >
                         <Icons.Play /> Preview Media
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-[var(--pink-100)] flex items-center justify-center text-8xl grayscale opacity-50">
                    📦
                  </div>
                )}
              </div>

              {/* --- PRODUCT INFO CARD --- */}
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_black] p-8">
                {/* Header: Title & Rating */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b-[3px] border-black pb-6">
                    <div>
                        <h1 className="font-black text-4xl md:text-5xl uppercase leading-none mb-2" style={{ color: textColor }}>
                            {product.name}
                        </h1>
                        <Link to={`/seller/${product.creator?.id}`} className="inline-flex items-center gap-2 hover:underline decoration-2">
                            <span className="text-gray-500 font-bold text-sm uppercase">By</span>
                            <span className="font-bold text-lg">{creatorName}</span>
                            {product.creator?.profile_image_url && <img src={product.creator.profile_image_url} className="w-6 h-6 rounded-full border border-black" />}
                        </Link>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-black text-white px-3 py-1 font-bold text-lg border-2 border-black shadow-[3px_3px_0px_gray]">
                            <span className="text-[var(--yellow-400)]">★</span> {reviewStats.avg?.toFixed(1) || "0.0"}
                        </div>
                        <span className="text-xs font-bold text-gray-500 mt-1 uppercase">{reviewStats.count} Reviews</span>
                    </div>
                </div>

                <p className="text-xl font-medium leading-relaxed mb-8 text-gray-700">
                    {shortDesc}
                </p>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 border-2 border-black p-4">
                        <h3 className="font-black uppercase text-sm mb-2 text-gray-400">What's Inside</h3>
                        <div className="flex items-center gap-2 font-bold">
                             <div className="bg-[var(--mint)] p-1 border border-black"><Icons.Check /></div>
                             <span>{product.files?.length || 0} Files Included</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 border-2 border-black p-4">
                         <h3 className="font-black uppercase text-sm mb-2 text-gray-400">File Type</h3>
                         <div className="flex items-center gap-2 font-bold">
                             <div className="bg-[var(--yellow-400)] p-1 border border-black"><span className="text-xs">ZIP</span></div>
                             <span>{product.files?.[0]?.content_type?.split("/")[1]?.toUpperCase() || "Digital Download"}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs / Accordion for Description */}
                {longDesc && (
                    <div className="mt-8 pt-8 border-t-[3px] border-black">
                        <h2 className="font-black text-2xl uppercase mb-4 bg-black text-white inline-block px-2">Description</h2>
                        <div className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: renderMarkdown(longDesc) }} />
                    </div>
                )}
              </div>

              {/* --- REVIEWS SECTION --- */}
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_black] p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="font-black text-3xl uppercase">Customer Reviews</h2>
                    <div className="hidden md:block h-1 flex-1 bg-black mx-4"></div>
                 </div>

                 <div className="grid md:grid-cols-3 gap-8 mb-10">
                    {/* Score Card */}
                    <div className="bg-[var(--pink-50)] border-[3px] border-black p-6 text-center flex flex-col justify-center shadow-[4px_4px_0px_black]">
                        <div className="text-6xl font-black mb-2">{reviewStats.avg.toFixed(1)}</div>
                        <div className="flex justify-center gap-1 mb-2">
                             {[1,2,3,4,5].map(s => <Icons.Star key={s} filled={s <= Math.round(reviewStats.avg)} />)}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Based on {reviewStats.count} ratings</div>
                    </div>

                    {/* Distribution Bars */}
                    <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                         {[5,4,3,2,1].map(stars => (
                             <div key={stars} className="flex items-center gap-3">
                                 <span className="font-bold text-sm w-8">{stars} ★</span>
                                 <div className="flex-1 h-3 bg-gray-200 border border-black rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-black" 
                                        style={{ width: `${reviewStats.count ? ((reviewStats.distribution[stars] || 0) / reviewStats.count) * 100 : 0}%` }} 
                                     />
                                 </div>
                                 <span className="text-xs font-bold w-6 text-right">{reviewStats.distribution[stars] || 0}</span>
                             </div>
                         ))}
                    </div>
                 </div>
                
                 {/* Review Form */}
                 {!userReview && isAuthenticated && !isCreator && (
                     <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 border-2 border-dashed border-black p-6">
                        <h3 className="font-bold text-lg uppercase mb-4">Leave a Review</h3>
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} type="button" onClick={() => setNewReview(prev => ({...prev, rating: star}))} className="hover:scale-110 transition-transform">
                                     <Icons.Star filled={star <= newReview.rating} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            value={newReview.comment}
                            onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
                            className="w-full p-4 border-2 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0px_var(--pink-400)] transition-shadow mb-4"
                            rows={3}
                            placeholder="How was the product?"
                        />
                        <button type="submit" disabled={submittingReview} className="px-6 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-[var(--pink-500)] transition-colors disabled:opacity-50">
                            {submittingReview ? "Submitting..." : "Post Review"}
                        </button>
                     </form>
                 )}

                 {/* Reviews List */}
                 <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_gray]">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[var(--yellow-200)] border-2 border-black rounded-full flex items-center justify-center font-bold">
                                        {(review.user?.name || "U").charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{review.user?.name || "Anonymous"}</p>
                                        <div className="flex text-xs">
                                             {[...Array(5)].map((_, i) => <Icons.Star key={i} filled={i < review.rating} />)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-bold">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                    {reviews.length === 0 && <p className="text-center italic text-gray-500">No reviews yet. Be the first!</p>}
                 </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (Sticky Buy Box) ================= */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
               
               <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_black] p-6 relative overflow-hidden" style={{ borderTop: `8px solid ${accentColor}` }}>
                  
                  {/* Price Section */}
                  <div className="mb-6 text-center border-b-2 border-dashed border-gray-300 pb-6">
                      <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Standard License</p>
                      <div className="text-6xl font-black text-black">
                         {currencySymbol}{product.price}
                      </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3">
                      <button 
                        onClick={handleBuyNow}
                        disabled={buying}
                        className="w-full py-4 bg-[var(--pink-500)] text-white font-black uppercase text-xl border-[3px] border-black shadow-[4px_4px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] active:translate-y-0 active:shadow-[2px_2px_0px_black] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {buying ? "Processing..." : hasPurchased ? "Download Now" : "Buy Now"}
                      </button>
                      
                      <button 
                        onClick={handleAddToCart}
                        style={{ backgroundColor: !inCart ? buttonColor : undefined }}
                        className={`w-full py-3 font-bold uppercase border-[3px] border-black transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-[var(--mint)] shadow-none translate-y-[2px]' : 'text-white shadow-[4px_4px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black]'}`}
                      >
                         <Icons.Cart /> {inCart ? "In Cart" : "Add to Cart"}
                      </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                      <button 
                        onClick={handleAddToWishlist}
                        className={`py-2 font-bold uppercase text-xs border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors ${inWishlist ? 'bg-[var(--pink-100)] text-[var(--pink-600)]' : 'bg-white'}`}
                      >
                         <Icons.Heart filled={inWishlist} /> {inWishlist ? 'Saved' : 'Wishlist'}
                      </button>
                      <div className="relative">
                          <button 
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="w-full h-full py-2 font-bold uppercase text-xs border-2 border-black bg-white hover:bg-[var(--yellow-100)] transition-colors flex items-center justify-center gap-2"
                          >
                            <Icons.Share /> Share
                          </button>
                          
                          {/* Share Menu Dropdown */}
                          {showShareMenu && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-3 border-black shadow-[4px_4px_0px_black] z-50 flex flex-col">
                                {['twitter', 'facebook', 'linkedin', 'copy'].map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => handleShare(p)} 
                                        className="px-4 py-2 text-left text-xs font-bold uppercase hover:bg-[var(--yellow-400)] border-b border-gray-100 last:border-0"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                          )}
                      </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 flex flex-col items-center gap-2 text-center">
                       <div className="flex gap-2 opacity-50 grayscale">
                          <div className="h-6 w-8 bg-gray-300 rounded"></div>
                          <div className="h-6 w-8 bg-gray-300 rounded"></div>
                          <div className="h-6 w-8 bg-gray-300 rounded"></div>
                       </div>
                       <p className="text-[10px] font-bold uppercase text-gray-400">Secure Payment via Razorpay</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- DETAILED PREVIEW MODAL --- */}
      {showDetailedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailedPreview(false)}>
          <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_white] max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 fade-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--yellow-400)] border-b-[4px] border-black px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-black uppercase text-xl">Media Gallery</h2>
              <button onClick={() => setShowDetailedPreview(false)} className="w-10 h-10 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center font-bold text-xl shadow-[3px_3px_0px_black]">
                ×
              </button>
            </div>
            
            <div className="p-8 space-y-12">
              {product.preview_videos?.length > 0 && (
                <div>
                  <h3 className="font-black text-2xl uppercase mb-6 flex items-center gap-2"><Icons.Play /> Videos</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.preview_videos.map((video, i) => (
                      <div key={i} className="aspect-video bg-black border-[3px] border-black shadow-[6px_6px_0px_gray]">
                        {video.includes("youtube") || video.includes("youtu.be") ? (
                          <iframe src={video.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allowFullScreen />
                        ) : video.includes("vimeo") ? (
                          <iframe src={video.replace("vimeo.com/", "player.vimeo.com/video/")} className="w-full h-full" allowFullScreen />
                        ) : (
                          <video src={video} controls className="w-full h-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.preview_images?.length > 0 && (
                <div>
                  <h3 className="font-black text-2xl uppercase mb-6">Screenshots</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.preview_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full border-[3px] border-black shadow-[6px_6px_0px_gray]" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}