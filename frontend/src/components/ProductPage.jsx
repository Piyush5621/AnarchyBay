import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { useRazorpay } from "react-razorpay";
import { 
  Star, ShoppingBag, Heart, Share2, ArrowLeft, 
  Check, Download, Package, Clock, Shield, 
  ExternalLink, MessageSquare, Plus, X, Globe, Zap, FileText, Flag
} from "lucide-react";

const COMMENT_CHAR_LIMIT = 500;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function renderMarkdown(text) {
  if (!text) return "";
  
  // Split by double newlines to get paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  let html = paragraphs.map(para => {
    // Headers
    if (para.startsWith('### ')) {
      return `<h3 class='text-lg font-bold mt-6 mb-3 text-gray-900'>${para.slice(4)}</h3>`;
    }
    if (para.startsWith('## ')) {
      return `<h2 class='text-xl font-bold mt-8 mb-4 text-gray-900'>${para.slice(3)}</h2>`;
    }
    if (para.startsWith('# ')) {
      return `<h1 class='text-2xl font-bold mt-10 mb-5 text-gray-900'>${para.slice(2)}</h1>`;
    }
    
    // Lists
    if (para.match(/^[-*] /m)) {
      const items = para.split('\n').filter(line => line.trim());
      const listItems = items.map(item => {
        const content = item.replace(/^[-*] /, '');
        return `<li class='mb-2'>${formatInline(content)}</li>`;
      }).join('');
      return `<ul class='list-disc list-inside space-y-2 mb-4 text-gray-700'>${listItems}</ul>`;
    }
    
    if (para.match(/^\d+\. /m)) {
      const items = para.split('\n').filter(line => line.trim());
      const listItems = items.map(item => {
        const content = item.replace(/^\d+\. /, '');
        return `<li class='mb-2'>${formatInline(content)}</li>`;
      }).join('');
      return `<ol class='list-decimal list-inside space-y-2 mb-4 text-gray-700'>${listItems}</ol>`;
    }
    
    // Regular paragraph
    return `<p class='mb-4 text-gray-700 leading-relaxed'>${formatInline(para)}</p>`;
  }).join('');
  
  return `<div class='prose prose-slate max-w-none'>${html}</div>`;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold text-gray-900'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-800'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-blue-600 hover:text-blue-700 underline font-medium' target='_blank' rel='noopener'>$1</a>");
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const { Razorpay } = useRazorpay();

  // Share handler
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this asset on Anarchy Bay!`;
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Report handler
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to report products");
      navigate("/login");
      return;
    }
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }
    
    setSubmittingReport(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/products/${productId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Report submitted successfully. Thank you for helping keep our marketplace safe!");
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else {
        toast.error(data.error || "Failed to submit report");
      }
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

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
        
        const reviewsRes = await fetch(`${API_URL}/api/reviews/product/${productId}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setReviewStats(reviewsData.stats || { avg: 0, count: 0, distribution: {} });
        setUserReview(reviewsData.reviews?.find((r) => r.user_id === user?.id) || null);

        const variantsRes = await fetch(`${API_URL}/api/products/${productId}/variants`);
        const variantsData = await variantsRes.json();
        setVariants(variantsData);
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user?.id]);

  const validateCoupon = async (code) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      return;
    }

    setValidatingCoupon(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/discounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          code: code.trim(),
          productId: productId 
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.valid) {
        setAppliedDiscount(data.discount);
        toast.success(`Coupon applied: ${data.discount.type === 'percentage' ? `${data.discount.value}%` : `₹${data.discount.value}`} off`);
      } else {
        setAppliedDiscount(null);
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch {
      setAppliedDiscount(null);
      toast.error('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedDiscount(null);
    toast.success('Coupon removed');
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (hasPurchased) {
      navigate(`/download/${purchaseData.id}`);
      return;
    }

    setBuying(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/purchases/checkout/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          variantId: selectedVariant?.id,
          discountCode: appliedDiscount ? couponCode : undefined,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Anarchy Bay",
        description: `License for ${product.name}`,
        image: "/favicon_io/android-chrome-512x512.png",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/purchases/verify/razorpay`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              toast.success("Payment verified. Asset license acquired!");
              navigate(`/checkout/success?purchase_id=${verifyData.purchase.id}`);
            } else {
              toast.error("Cryptographic verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Integrity error verifying payment");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0071e3",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Gateway error");
    } finally {
      setBuying(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to save assets");
      navigate("/login");
      return;
    }
    try {
      const token = getAccessToken();
      if (inWishlist) {
        await fetch(`${API_URL}/api/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setInWishlist(false);
        toast.success("Removed from Wishlist");
      } else {
        await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
        setInWishlist(true);
        toast.success("Added to Wishlist");
      }
    } catch {
      toast.error("Wishlist sync failed");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to use cart");
      navigate("/login");
      return;
    }
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
        toast.success("Added to cart");
      }
    } catch {
      toast.error("Cart sync failed");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to review");
      navigate("/login");
      return;
    }
    if (newReview.comment.length > COMMENT_CHAR_LIMIT) {
      toast.error(`Limit ${COMMENT_CHAR_LIMIT} chars`);
      return;
    }
    setSubmittingReview(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error("Feedback submission failed");
      toast.success("Feedback submitted!");
      setNewReview({ rating: 5, comment: "" });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-32">
          <div className="max-w-7xl mx-auto px-4 animate-pulse">
            <div className="h-[60vh] bg-gray-50 rounded-[3rem] mb-12" />
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-20 bg-gray-50 rounded-3xl" />
                <div className="h-64 bg-gray-50 rounded-3xl" />
              </div>
              <div className="lg:col-span-4 h-96 bg-gray-50 rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-40 text-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Package size={48} />
            </div>
          <h1 className="text-4xl font-black mb-4">Asset Not Found</h1>
          <p className="text-gray-500 mb-10">The item may have been removed or relocated.</p>
          <button onClick={() => navigate("/browse")} className="px-8 py-4 bg-[#0071e3] text-white rounded-2xl font-bold">Browse Marketplace</button>
        </main>
      </div>
    );
  }

  const currencySymbol = product.currency === "INR" ? "₹" : "$";
  const creatorName = product.creator?.display_name || product.creator?.name || "Anonymous";
  const shortDesc = product.short_description || product.description?.slice(0, 200) || "";
  const longDesc = product.long_description || product.description || "";
  const coverImage = product.thumbnail_url || product.image_url?.[0];
  const isCreator = user?.id === product.creator_id;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: product.page_color || '#ffffff', color: product.text_color || '#1d1d1f' }}>
      <NavBar />

      <main className="pt-24 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
             <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#0071e3] transition-colors group"
            >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                Back
            </button>

            {isCreator && (
              <button
                onClick={() => navigate(`/edit-product/${productId}`)}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus size={16} className="rotate-45" /> Edit Asset
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Content Area */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Cover Media */}
              <div className="relative rounded-[2.5rem] bg-gray-50 overflow-hidden border border-gray-100 group shadow-sm">
                <div className="aspect-video flex items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package size={120} className="text-gray-200" />
                  )}
                </div>
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  {product.category?.map((cat, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-[#0071e3] shadow-sm border border-white">
                      {cat}
                    </span>
                  ))}
                </div>
                {(product.preview_images?.length > 0 || product.preview_videos?.length > 0) && (
                  <button
                    onClick={() => setShowDetailedPreview(true)}
                    className="absolute bottom-6 left-6 px-6 py-3 bg-black/80 backdrop-blur-xl text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                  >
                    <Globe size={16} /> Technical Gallery
                  </button>
                )}
              </div>

              {/* Product Info Card */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={18} fill={s <= Math.round(reviewStats.avg) ? "currentColor" : "none"} className={s <= Math.round(reviewStats.avg) ? "" : "text-gray-200"} />
                        ))}
                      </div>
                      <span className="font-black text-sm">{reviewStats.avg?.toFixed(1) || "0.0"}</span>
                      <span className="text-gray-400 font-bold text-sm">({reviewStats.count})</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">{product.name}</h1>
                  </div>

                  <Link to={`/seller/${product.creator?.id}`} className="group flex items-center gap-4 p-4 rounded-[2rem] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-200">
                       {product.creator?.profile_image_url ? <img src={product.creator.profile_image_url} alt="" className="w-full h-full object-cover" /> : creatorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Published by</p>
                      <p className="font-bold group-hover:text-[#0071e3] transition-colors">{creatorName}</p>
                    </div>
                  </Link>
                </div>

                <p className="text-xl font-medium text-gray-500 leading-relaxed border-l-4 border-blue-50 pl-6">{shortDesc}</p>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                   <StatItem icon={<Download size={18} />} label="Usage" value={`${product.sales_count || 0} Licenses`} />
                   <StatItem icon={<Package size={18} />} label="Payload" value={`${product.files?.length || 0} Assets`} />
                   <StatItem icon={<Clock size={18} />} label="Last Update" value={new Date(product.updated_at).toLocaleDateString()} />
                   <StatItem icon={<Shield size={18} />} label="License" value="Standard" />
                </div>
              </div>

              {/* Description */}
              {longDesc && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                    <FileText size={24} className="text-blue-500" />
                    Technical Manifesto
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(longDesc) }} />
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                 <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <MessageSquare size={24} className="text-purple-500" />
                        Network Feedback
                    </h2>
                    {reviewStats.count > 0 && (
                        <div className="text-right">
                             <p className="text-4xl font-black tracking-tighter">{reviewStats.avg.toFixed(1)}</p>
                             <p className="text-[10px] font-black uppercase text-gray-400">Protocol Score</p>
                        </div>
                    )}
                 </div>

                 {reviewStats.count > 0 && (
                    <div className="grid md:grid-cols-5 gap-8 mb-16 pb-16 border-b border-gray-50">
                        <div className="md:col-span-2 space-y-3">
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <div key={stars} className="flex items-center gap-4">
                                    <span className="text-xs font-black w-4">{stars}</span>
                                    <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${reviewStats.count ? ((reviewStats.distribution[stars] || 0) / reviewStats.count) * 100 : 0}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 w-6">{reviewStats.distribution[stars] || 0}</span>
                                </div>
                            ))}
                        </div>
                        <div className="md:col-span-3 bg-gray-50 rounded-3xl p-6 flex items-center justify-center text-center">
                            <p className="text-sm font-bold text-gray-400 leading-relaxed italic">Market performance indicates high satisfaction levels for technical implementation.</p>
                        </div>
                    </div>
                 )}

                 {!userReview && isAuthenticated && !isCreator && (
                    <div className="mb-12">
                        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black uppercase text-xs tracking-widest text-[#1d1d1f]">Broadcast Feedback</h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setNewReview((r) => ({ ...r, rating: star }))} className="hover:scale-125 transition-transform">
                                        <Star size={24} className={star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                    </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value.slice(0, COMMENT_CHAR_LIMIT) }))}
                                placeholder="Your technical experience with this asset..."
                                rows={4}
                                className="w-full p-6 bg-white border border-gray-100 rounded-2xl font-medium outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm mb-4"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400">{newReview.comment.length} / {COMMENT_CHAR_LIMIT} Chars</span>
                                <button type="submit" disabled={submittingReview} className="px-8 py-3 bg-[#1d1d1f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Submit Review</button>
                            </div>
                        </form>
                    </div>
                 )}

                 <div className="space-y-8">
                    {reviews.length === 0 ? (
                      <div className="py-20 text-center text-gray-300 font-bold italic">No feedback logs found in registry.</div>
                    ) : (
                      reviews.map((review) => <ReviewItem key={review.id} review={review} />)
                    )}
                 </div>
              </div>
            </div>

            {/* Right Sidebar - Sticky Buy Section */}
            <div className="lg:col-span-4">
               <div className="lg:sticky lg:top-32">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    
                    <div className="mb-6">
                        {appliedDiscount ? (
                          <div>
                            <div className="text-2xl font-bold text-gray-400 line-through mb-1">
                                {currencySymbol}{product.price}
                            </div>
                            <div className="text-4xl font-bold text-gray-900">
                                {currencySymbol}{(parseFloat(product.price) - (appliedDiscount.type === 'percentage' 
                                  ? (parseFloat(product.price) * appliedDiscount.value) / 100 
                                  : appliedDiscount.value)).toFixed(2)}
                            </div>
                            <p className="text-sm text-green-600 font-medium mt-1">Save {currencySymbol}{(appliedDiscount.type === 'percentage' 
                              ? (parseFloat(product.price) * appliedDiscount.value) / 100 
                              : appliedDiscount.value).toFixed(2)} with code {couponCode}</p>
                          </div>
                        ) : (
                          <div className="text-4xl font-bold text-gray-900">
                              {currencySymbol}{product.price}
                          </div>
                        )}
                    </div>

                    {!hasPurchased && !appliedDiscount && (
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => setShowCouponInput(!showCouponInput)}
                                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                            >
                                {showCouponInput ? 'Hide' : 'Have a discount code?'}
                            </button>
                            {showCouponInput && (
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="CODE"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                        onKeyDown={(e) => e.key === 'Enter' && validateCoupon(couponCode)}
                                    />
                                    <button
                                        onClick={() => validateCoupon(couponCode)}
                                        disabled={validatingCoupon || !couponCode.trim()}
                                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {validatingCoupon ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {appliedDiscount && !hasPurchased && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-green-800 truncate">{couponCode} applied</p>
                            </div>
                            <button
                                onClick={removeCoupon}
                                className="text-green-600 hover:text-red-600 transition-colors"
                                title="Remove"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleBuyNow}
                        disabled={buying}
                        className="w-full py-3.5 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mb-3"
                        style={{ 
                          backgroundColor: product.button_color || '#000000', 
                          color: '#ffffff'
                        }}
                    >
                        {buying ? (
                            <Zap className="animate-spin" size={18} />
                        ) : hasPurchased ? (
                            <><Download size={18} /> Download</>
                        ) : (
                            <>I want this</>
                        )}
                    </button>

                    {!hasPurchased && (
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} />
                            {inCart ? "In Cart" : "Add to Cart"}
                        </button>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Check size={16} className="text-green-600" />
                            <span>Instant access</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Check size={16} className="text-green-600" />
                            <span>Lifetime updates</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Check size={16} className="text-green-600" />
                            <span>Commercial license</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAddToWishlist}
                                className={`flex-1 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 ${inWishlist ? "border-pink-500 text-pink-500 bg-pink-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                            >
                                <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
                                <span className="text-sm font-medium">{inWishlist ? "Saved" : "Save"}</span>
                            </button>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowShareMenu(!showShareMenu)} 
                                    className="p-2.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                                >
                                    <Share2 size={18} className="text-gray-600" />
                                </button>
                                {showShareMenu && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                                        {['Twitter', 'Facebook', 'LinkedIn', 'Copy'].map((item) => (
                                            <button key={item} onClick={() => handleShare(item.toLowerCase())} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">{item}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isCreator && (
                          <button 
                              onClick={() => setShowReportModal(true)} 
                              className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                          >
                              <Flag size={16} />
                              Report Product
                          </button>
                        )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modals and Overlays */}
      {showDetailedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#1d1d1f]/95 backdrop-blur-xl animate-in fade-in transition-all" onClick={() => setShowDetailedPreview(false)}>
          <div className="bg-white rounded-[3rem] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Technical Visualizer</h2>
              <button onClick={() => setShowDetailedPreview(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 md:p-12 overflow-y-auto space-y-16">
              {product.preview_videos?.length > 0 && (
                <div className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#0071e3] bg-blue-50 px-4 py-1.5 rounded-full inline-block">Motion Data</h3>
                  <div className="grid gap-8">
                    {product.preview_videos.map((v, i) => (
                      <div key={i} className="aspect-video bg-black rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl">
                        {v.includes("youtube") || v.includes("youtu.be") ? (
                          <iframe src={v.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allowFullScreen />
                        ) : (
                          <video src={v} controls className="w-full h-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.preview_images?.length > 0 && (
                <div className="space-y-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#ec4899] bg-pink-50 px-4 py-1.5 rounded-full inline-block">Static Analytics</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {product.preview_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="rounded-[2rem] border border-gray-100 shadow-lg w-full h-auto" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flag size={20} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold">Report Product</h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Help us maintain a safe marketplace. Your report will be reviewed by our admin team.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Report *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Misleading Information">Misleading Information</option>
                  <option value="Malware or Security Risk">Malware or Security Risk</option>
                  <option value="Poor Quality">Poor Quality</option>
                  <option value="Scam or Fraud">Scam or Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide any additional information that would help us review this report..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1">{reportDescription.length}/500 characters</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport || !reportReason}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag size={16} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ review }) {
  const userName = review.user?.display_name || review.user?.name || "Anonymous";
  return (
    <div className="flex gap-6 pb-8 border-b border-gray-50 last:border-0 group">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center font-bold text-gray-400">
        {review.user?.profile_image_url ? <img src={review.user.profile_image_url} alt="" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
           <p className="font-bold">{userName}</p>
           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-0.5 text-yellow-500">
           {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= review.rating ? "currentColor" : "none"} className={s <= review.rating ? "" : "text-gray-100"} />)}
        </div>
        {review.comment && <p className="text-gray-600 leading-relaxed pt-2">{review.comment}</p>}
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {icon} {label}
            </div>
            <p className="font-bold text-sm">{value}</p>
        </div>
    );
}

function FeatureItem({ label }) {
    return (
        <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {label}
        </div>
    );
}
