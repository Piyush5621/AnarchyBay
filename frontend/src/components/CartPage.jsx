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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 border-3 border-black" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic mb-8 tracking-tighter">
            Your <span className="text-[var(--pink-500)] underline">Cart</span>
          </h1>

          {cartItems.length === 0 ? (
            <div className="bg-white border-4 border-black shadow-[10px_10px_0px_var(--black)] p-16 text-center">
              <div className="text-8xl mb-8">🛒</div>
              <h2 className="text-3xl font-black uppercase italic mb-6">Your cart is empty</h2>
              <p className="text-gray-600 mb-10 font-bold text-lg">Browse our products and add items to your cart</p>
              <button
                onClick={() => navigate('/browse')}
                className="px-12 py-5 font-black uppercase italic bg-[var(--yellow-400)] text-black border-4 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white border-4 border-black shadow-[6px_6px_0px_var(--black)] p-6 flex gap-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--black)] transition-all">
                    <Link to={`/product/${item.product_id}`} className="w-32 h-32 flex-shrink-0 bg-gray-100 border-4 border-black overflow-hidden shadow-[3px_3px_0px_var(--black)]">
                      {item.product?.thumbnail_url ? (
                        <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${item.product_id}`} className="font-black text-2xl uppercase italic hover:text-[var(--pink-500)] transition-colors line-clamp-1">
                          {item.product?.name || 'Product'}
                        </Link>
                        <p className="text-sm text-gray-600 font-bold line-clamp-2 mt-2">{item.product?.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-2xl text-[var(--pink-600)]">
                          {currencySymbol}{item.product?.price || 0}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="px-4 py-2 font-black text-sm uppercase bg-black text-white border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:bg-white hover:text-black transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-[var(--mint)] border-4 border-black shadow-[8px_8px_0px_var(--black)] p-8 sticky top-24">
                  <h2 className="font-black text-2xl uppercase italic mb-6 border-b-4 border-black pb-2">Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm font-bold">
                        <span className="truncate max-w-[140px] uppercase">{item.product?.name}</span>
                        <span className="font-black">{currencySymbol}{item.product?.price || 0}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-4 border-black pt-6 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-2xl uppercase italic">Total</span>
                      <span className="font-black text-3xl text-[var(--pink-600)]">{currencySymbol}{total}</span>
                    </div>
                    <p className="font-black uppercase text-xs mt-2 text-gray-700">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in bag</p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full py-5 font-black text-xl uppercase italic bg-[var(--pink-500)] text-white border-4 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_var(--black)] transition-all disabled:opacity-50"
                  >
                    {checkingOut ? (
                      <span className="flex items-center justify-center gap-4">
                        <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'CHECKOUT NOW'
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="font-black uppercase text-xs text-gray-700">
                      Secure Payment via Razorpay
                    </p>
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
