import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';
import NavBar from './NavBar';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/api/client';
import { useRazorpay } from "react-razorpay";

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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="h-12 w-48 bg-gray-300 mb-8 border-2 border-black" />
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)]" />
                ))}
              </div>
              <div className="lg:col-span-4 h-96 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header Section */}
          <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-4">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--black)] to-[var(--yellow-500)]">Cart</span>
              </h1>
              <p className="font-bold text-gray-600 mt-2 uppercase tracking-widest text-sm">
                Review your items before they're gone
              </p>
            </div>
            <div className="hidden md:block text-right">
               <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1 uppercase">
                 Current Date: {new Date().toLocaleDateString()}
               </span>
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-12 md:p-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-24 h-24 bg-[var(--yellow-400)] border-3 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_var(--black)]">
                <span className="text-5xl">🛒</span>
              </div>
              <h2 className="text-4xl font-black uppercase italic mb-4">It's pretty quiet here</h2>
              <p className="text-gray-600 mb-8 font-bold text-lg max-w-md">
                Your cart is looking a bit lonely. Go find some digital treasures to fill it up!
              </p>
              <button
                onClick={() => navigate('/browse')}
                className="px-10 py-4 font-black uppercase text-lg bg-black text-white border-3 border-black shadow-[5px_5px_0px_gray] hover:bg-[var(--pink-500)] hover:shadow-[5px_5px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            /* Cart Content Grid */
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cart Items */}
              <div className="lg:col-span-8 space-y-6">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group bg-white border-3 border-black shadow-[5px_5px_0px_var(--black)] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--black)] transition-all"
                  >
                    {/* Product Image */}
                    <Link 
                      to={`/product/${item.product_id}`} 
                      className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-100 border-2 border-black overflow-hidden relative"
                    >
                      {item.product?.thumbnail_url ? (
                        <img 
                          src={item.product.thumbnail_url} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--pink-100)]">📦</div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <Link 
                            to={`/product/${item.product_id}`} 
                            className="font-black text-xl sm:text-2xl uppercase leading-tight hover:underline decoration-2 underline-offset-2"
                          >
                            {item.product?.name || 'Unknown Product'}
                          </Link>
                          <span className="font-mono font-bold text-xl">
                            {currencySymbol}{item.product?.price || 0}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-bold mt-2 line-clamp-2 max-w-md border-l-2 border-[var(--yellow-400)] pl-2">
                          {item.product?.description || 'No description available'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                         <span className="text-xs font-black uppercase bg-gray-100 border border-black px-2 py-1">
                           Digital Item
                         </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-xs font-black uppercase text-red-600 hover:bg-red-100 px-3 py-1.5 border-2 border-transparent hover:border-red-600 transition-all flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Summary (Receipt Style) */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="bg-[var(--yellow-300)] border-3 border-black shadow-[8px_8px_0px_var(--black)] relative">
                  {/* Decorative Tape */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-[var(--pink-200)]/80 border border-black/20 rotate-1 backdrop-blur-sm z-10"></div>
                  
                  <div className="p-6">
                    <h2 className="font-black text-2xl uppercase text-center border-b-2 border-dashed border-black pb-4 mb-4">
                      Receipt
                    </h2>
                    
                    <div className="space-y-3 mb-6 font-mono text-sm">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <span className="truncate pr-4 uppercase font-bold">{item.product?.name}</span>
                          <span className="whitespace-nowrap">{currencySymbol}{item.product?.price || 0}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-black border-dashed pt-4 mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black uppercase text-lg">Total</span>
                        <span className="font-black text-3xl">{currencySymbol}{total}</span>
                      </div>
                      <p className="text-right text-xs font-bold uppercase text-gray-700">
                        Including Taxes
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full py-4 font-black text-xl uppercase italic bg-black text-white border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      {checkingOut ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="relative z-10 group-hover:translate-x-1 transition-transform inline-block">
                          Pay Now &rarr;
                        </span>
                      )}
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-widest">Powered by Razorpay</span>
                    </div>
                  </div>

                  {/* Receipt Jagged Edge Bottom */}
                  <div className="h-4 bg-[var(--yellow-300)] w-full relative" 
                       style={{ 
                         backgroundImage: 'linear-gradient(45deg, transparent 75%, white 75%), linear-gradient(-45deg, transparent 75%, white 75%)', 
                         backgroundSize: '10px 10px',
                         backgroundPosition: '0 100%' 
                       }}>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}