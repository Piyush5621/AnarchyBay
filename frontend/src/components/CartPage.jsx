import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';
import NavBar from './NavBar';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/api/client';
import { useRazorpay } from "react-razorpay";
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Zap, Minus, Plus, CreditCard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const { Razorpay } = useRazorpay();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const token = getAccessToken();
      const productIds = cartItems.map(item => item.product_id);

      // 1. Create Order
      const orderRes = await fetch(`${API_URL}/api/purchases/checkout/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
          name: "Anarchy Bay",
          description: `Purchase of ${cartItems.length} items`,
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
              toast.success("Payment successful!");
              // Clear cart after successful checkout
              for (const item of cartItems) {
                await fetch(`${API_URL}/api/cart/${item.product_id}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
              navigate(`/checkout/success?order_id=${orderData.orderId}`);
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
      toast.error(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  const currency = cartItems[0]?.product?.currency || 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <NavBar />
        <main className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="animate-pulse space-y-8">
              <div className="h-12 w-48 bg-gray-200 rounded-lg mb-8" />
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-gray-200 rounded-3xl" />
                  ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-3xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <NavBar />

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tight text-black">
                Your <span className="text-blue-600">Cart</span>
              </h1>
              <p className="text-gray-500 font-bold mt-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>
            {cartItems.length > 0 && (
              <button 
                onClick={() => navigate('/browse')}
                className="text-sm font-black uppercase tracking-wider text-gray-400 hover:text-black transition-colors flex items-center gap-2 border-b-2 border-transparent hover:border-black pb-1"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </header>

          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-2 border-black/5 rounded-[3rem] p-12 sm:p-20 text-center shadow-xl shadow-black/5"
            >
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-16 h-16 text-gray-200" />
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-10 font-bold text-lg max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
              <button
                onClick={() => navigate('/browse')}
                className="group px-12 py-5 font-black uppercase italic bg-black text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-blue-200"
              >
                Browse Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="group bg-white border border-black/5 rounded-[2.5rem] p-5 sm:p-7 flex flex-col sm:flex-row gap-6 sm:items-center hover:border-black/20 hover:shadow-2xl transition-all duration-500"
                    >
                      <Link to={`/product/${item.product_id}`} className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-50 rounded-3xl overflow-hidden border border-black/5">
                        {item.product?.thumbnail_url ? (
                          <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                        )}
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <Link to={`/product/${item.product_id}`} className="font-black text-2xl uppercase italic hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                            {item.product?.name || 'Product'}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-400 font-bold line-clamp-2 mt-1 mb-4 leading-relaxed">
                          {item.product?.description}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-black/5 pt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-gray-50 px-3 py-1 rounded-full">
                              Digital Asset
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-3 py-1 rounded-full">
                              In Stock
                            </span>
                          </div>
                          <span className="font-black text-2xl text-black tracking-tighter">
                            {currencySymbol}{item.product?.price || 0}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-8 py-8 opacity-40 grayscale">
                   <div className="flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Zap className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instant Delivery</span>
                   </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-black/5 rounded-[3rem] p-10 sticky top-28 shadow-2xl shadow-black/5 overflow-hidden">
                  <h2 className="font-black text-2xl uppercase italic mb-8 border-b border-black/5 pb-4">Order Summary</h2>
                  
                  <div className="space-y-5 mb-10">
                    <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                      <span className="uppercase tracking-wider">Subtotal ({cartItems.length} items)</span>
                      <span className="text-black font-black text-lg">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                      <span className="uppercase tracking-wider">Estimated Tax</span>
                      <span className="text-black font-black text-lg">{currencySymbol}0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl">
                      <span className="uppercase tracking-wider">Promo Applied</span>
                      <span className="font-black text-lg">-$0.00</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-black/5 pt-8 mb-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="font-black uppercase text-xs tracking-[0.2em] text-gray-400 block mb-1">Grand Total</span>
                        <span className="font-black text-5xl text-black tracking-tighter italic">
                          {currencySymbol}{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="group w-full py-6 font-black text-xl uppercase italic bg-black text-white rounded-[2rem] hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:bg-gray-200 flex items-center justify-center gap-4 shadow-2xl shadow-blue-200 active:scale-[0.98]"
                  >
                    {checkingOut ? (
                      <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        Pay Securely
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="mt-8 flex flex-col items-center gap-4 text-center">
                    <div className="flex -space-x-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                         </div>
                       ))}
                    </div>
                    <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                      Joined by <span className="text-black">2,000+</span> creators <br/> buying assets daily
                    </p>
                  </div>

                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
