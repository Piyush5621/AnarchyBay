import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { useRazorpay } from "react-razorpay";

const COMMENT_CHAR_LIMIT = 500;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/^### (.+)$/gm, "<h3 class='text-xl font-bold mt-4 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-bold mt-5 mb-2'>$2</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-3xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-2 py-1 bg-[var(--yellow-400)] border-2 border-black text-sm font-mono'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class='ml-4 list-decimal'>$2</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-[var(--pink-600)] underline font-bold hover:bg-[var(--pink-100)]' target='_blank' rel='noopener'>$1</a>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/\n/g, "<br/>");
  return `<p class='mb-3'>${html}</p>`;
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [checkingPurchase, setCheckingPurchase] = useState(true); // eslint-disable-line no-unused-vars
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]); // eslint-disable-line no-unused-vars
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
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
        }),
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
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#000000",
        },
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
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
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
    if (!isAuthenticated) {
      toast.error("Please login first");
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
        toast.success("Added to cart!");
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to review");
      navigate("/login");
      return;
    }
    if (newReview.comment.length > COMMENT_CHAR_LIMIT) {
      toast.error(`Comment must be under ${COMMENT_CHAR_LIMIT} characters`);
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
      toast.success("Review submitted!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] aspect-[16/9] animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-28 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-12">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
              <button onClick={() => navigate("/browse")} className="px-8 py-4 text-lg font-bold uppercase border-3 border-black bg-[var(--yellow-400)] shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all">
                Browse Products
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currencySymbol = product.currency === "INR" ? "₹" : "$";
  const creatorName = product.creator?.display_name || product.creator?.name || "Anonymous";
  const shortDesc = product.short_description || product.description?.slice(0, 200) || "";
  const longDesc = product.long_description || product.description || "";
  const coverImage = product.thumbnail_url || product.image_url?.[0];
  const pageColor = product.page_color || "#ffffff";
  const accentColor = product.accent_color || "#ffde59";
  const buttonColor = product.button_color || "#ec4899";
  const textColor = product.text_color || "#000000";
  const isCreator = user?.id === product.creator_id;

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageColor }}>
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isCreator && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => navigate(`/edit-product/${productId}`)}
                className="px-5 py-3 text-sm font-bold uppercase bg-white border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--black)] transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Product
              </button>
            </div>
          )}

          <div className="relative mb-8">
            {coverImage ? (
              <>
                <img src={coverImage} alt={product.name} className="w-full h-auto max-h-[70vh] object-contain mx-auto" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.category?.map((cat, i) => (
                    <span key={i} className="px-4 py-2 text-sm font-bold uppercase bg-[var(--mint)] border-3 border-black shadow-[2px_2px_0px_var(--black)]">
                      {cat}
                    </span>
                  ))}
                </div>
                {(product.preview_images?.length > 0 || product.preview_videos?.length > 0) && (
                  <button
                    onClick={() => setShowDetailedPreview(true)}
                    className="absolute bottom-4 left-4 px-5 py-3 text-sm font-bold uppercase bg-white border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--black)] transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                )}
              </>
            ) : (
              <div className="w-full aspect-[16/9] bg-[var(--pink-100)] border-3 border-black shadow-[6px_6px_0px_var(--black)] flex items-center justify-center">
                <span className="text-9xl">📦</span>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-6 h-6 ${star <= Math.round(reviewStats.avg || 0) ? "fill-[var(--yellow-400)]" : "fill-gray-300"}`} style={star <= Math.round(reviewStats.avg || 0) ? { fill: accentColor } : undefined} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-lg" style={{ color: textColor }}>{reviewStats.avg?.toFixed(1) || "0.0"}</span>
                  <span style={{ color: textColor, opacity: 0.6 }}>({reviewStats.count || 0} reviews)</span>
                </div>

                <h1 className="font-display text-4xl lg:text-5xl mb-6" style={{ color: textColor }}>{product.name}</h1>

                <p className="text-xl leading-relaxed mb-8" style={{ color: textColor, opacity: 0.8 }}>{shortDesc}</p>

                <Link to={`/seller/${product.creator?.id}`} className="inline-flex items-center gap-3 group px-4 py-3 border-2 border-black hover:shadow-[3px_3px_0px_var(--black)] transition-all" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-lg font-bold overflow-hidden" style={{ backgroundColor: accentColor }}>
                    {product.creator?.profile_image_url ? <img src={product.creator.profile_image_url} alt="" className="w-full h-full object-cover" /> : creatorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: textColor, opacity: 0.6 }}>Created by</p>
                    <p className="font-bold text-lg" style={{ color: textColor }}>{creatorName}</p>
                  </div>
                </Link>

                <div className="mt-8 pt-6 border-t-3 border-black">
                  <h3 className="font-bold text-lg uppercase mb-4" style={{ color: textColor }}>What&apos;s Included</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Instant access", "All files included", "Commercial license", "Lifetime updates"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-base" style={{ color: textColor }}>
                        <span className="w-6 h-6 border-2 border-black flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-3 border-black">
                  <h3 className="font-bold text-lg uppercase mb-4" style={{ color: textColor }}>File Info</h3>
                  <div className="flex gap-6 text-base">
                    <div style={{ color: textColor }}>
                      <span style={{ opacity: 0.6 }}>Files:</span> <span className="font-bold">{product.files?.length || 0}</span>
                    </div>
                    {product.files?.[0] && (
                      <>
                        <div style={{ color: textColor }}>
                          <span style={{ opacity: 0.6 }}>Format:</span> <span className="font-bold">{product.files[0].content_type?.split("/")[1]?.toUpperCase() || "N/A"}</span>
                        </div>
                        <div style={{ color: textColor }}>
                          <span style={{ opacity: 0.6 }}>Size:</span> <span className="font-bold">{product.files[0].file_size ? `${(product.files[0].file_size / 1024 / 1024).toFixed(2)} MB` : "N/A"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {longDesc && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                  <h2 className="font-display text-3xl mb-6" style={{ color: textColor }}>About this product</h2>
                  <div className="text-lg leading-relaxed prose prose-lg max-w-none" style={{ color: textColor, opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(longDesc) }} />
                </div>
              )}

              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                <h2 className="font-display text-3xl mb-6">Reviews</h2>

                {reviewStats.count > 0 && (
                  <div className="flex items-start gap-8 mb-8 pb-8 border-b-3 border-black">
                    <div className="text-center">
                      <div className="font-display text-6xl">{reviewStats.avg.toFixed(1)}</div>
                      <div className="flex justify-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-5 h-5 ${star <= Math.round(reviewStats.avg) ? "fill-[var(--yellow-400)]" : "fill-gray-300"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm font-bold mt-1">{reviewStats.count} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm font-bold w-4">{stars}</span>
                          <div className="flex-1 h-4 bg-gray-200 border-2 border-black overflow-hidden">
                            <div className="h-full bg-[var(--yellow-400)]" style={{ width: `${reviewStats.count ? ((reviewStats.distribution[stars] || 0) / reviewStats.count) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-bold w-6">{reviewStats.distribution[stars] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!userReview && isAuthenticated && product.creator?.id !== user?.id && (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-[var(--pink-50)] border-3 border-black">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl uppercase">Write a Review</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setNewReview((r) => ({ ...r, rating: star }))} className="p-0.5 hover:scale-110 transition-transform">
                            <svg className={`w-8 h-8 ${star <= newReview.rating ? "fill-[var(--yellow-400)]" : "fill-gray-300"}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value.slice(0, COMMENT_CHAR_LIMIT) }))}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full px-4 py-3 border-3 border-black bg-white placeholder:text-gray-400 focus:outline-none focus:shadow-[3px_3px_0px_var(--black)] resize-none text-lg"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-bold">{newReview.comment.length}/{COMMENT_CHAR_LIMIT}</span>
                      <button type="submit" disabled={submittingReview} className="px-6 py-3 font-bold uppercase border-3 border-black bg-[var(--pink-500)] text-white shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--black)] transition-all disabled:opacity-50">
                        {submittingReview ? "Posting..." : "Post Review"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center py-8 text-xl text-gray-500">No reviews yet</p>
                  ) : (
                    reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                  )}
                </div>
              </div>
            </div>

            <div className="lg:w-[380px] flex-shrink-0">
              <div className="border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8" style={{ backgroundColor: accentColor }}>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-5xl">{currencySymbol}{product.price}</span>
                  <span className="text-lg font-bold uppercase">one-time</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  style={!inCart ? { backgroundColor: buttonColor } : undefined}
                  className={`w-full py-5 text-xl font-bold uppercase border-3 border-black transition-all mb-4 ${inCart ? "bg-[var(--mint)] shadow-[4px_4px_0px_var(--black)]" : "text-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)]"}`}
                >
                  {inCart ? "✓ Added to Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="w-full py-5 font-black text-xl uppercase italic bg-[var(--pink-500)] text-white border-4 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {buying ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : hasPurchased ? (
                    "Download Files"
                  ) : (
                    `Buy Now • ${product.currency === "INR" ? "₹" : "$"}${selectedVariant ? selectedVariant.price : product.price}`
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToWishlist}
                    className={`flex-1 py-4 font-bold uppercase border-3 border-black transition-all flex items-center justify-center gap-2 ${inWishlist ? "bg-[var(--pink-200)]" : "bg-white hover:bg-[var(--pink-100)]"}`}
                  >
                    <svg className="w-6 h-6" fill={inWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {inWishlist ? "Saved" : "Save"}
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-4 border-3 border-black bg-white hover:bg-[var(--mint)] transition-all">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] z-50 min-w-[160px] overflow-hidden">
                        <button onClick={() => handleShare("twitter")} className="w-full px-4 py-3 text-left font-bold hover:bg-[var(--yellow-400)] transition-colors border-b-2 border-black">Twitter</button>
                        <button onClick={() => handleShare("facebook")} className="w-full px-4 py-3 text-left font-bold hover:bg-[var(--yellow-400)] transition-colors border-b-2 border-black">Facebook</button>
                        <button onClick={() => handleShare("linkedin")} className="w-full px-4 py-3 text-left font-bold hover:bg-[var(--yellow-400)] transition-colors border-b-2 border-black">LinkedIn</button>
                        <button onClick={() => handleShare("copy")} className="w-full px-4 py-3 text-left font-bold hover:bg-[var(--yellow-400)] transition-colors">Copy Link</button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-center font-bold text-sm uppercase mt-4 opacity-70">No refunds</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDetailedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowDetailedPreview(false)}>
          <div className="bg-white border-3 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--yellow-400)] border-b-3 border-black px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">Product Details</h2>
              <button onClick={() => setShowDetailedPreview(false)} className="w-10 h-10 border-3 border-black bg-white hover:bg-red-100 transition-colors flex items-center justify-center font-bold text-xl">
                ×
              </button>
            </div>
            <div className="p-6 space-y-8">
              {product.preview_videos?.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl uppercase mb-4">Video Preview</h3>
                  <div className="space-y-4">
                    {product.preview_videos.map((video, i) => (
                      <div key={i} className="aspect-video bg-black border-3 border-black overflow-hidden">
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
                  <h3 className="font-bold text-xl uppercase mb-4">Preview Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.preview_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="border-3 border-black" />
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

function ReviewCard({ review }) {
  const userName = review.user?.display_name || review.user?.name || "Anonymous";

  return (
    <div className="p-5 bg-white border-3 border-black">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[var(--pink-200)] border-2 border-black flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0">
          {review.user?.profile_image_url ? <img src={review.user.profile_image_url} alt="" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-lg">{userName}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-[var(--yellow-400)]" : "fill-gray-300"}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
          {review.comment && <p className="text-lg text-gray-700">{review.comment}</p>}
        </div>
      </div>
    </div>
  );
}