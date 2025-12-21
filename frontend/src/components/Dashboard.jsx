import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import useTotalUsers from "@/hooks/profile/use-total-users";
import useUserProfileInfo from "@/hooks/profile/use-user-profile-info";
import useTotalProducts from "@/hooks/products/use-total-products";
import NavBar from "./NavBar";
import { supabase } from "@/lib/supabase";
import { saveSessionTokens, getAccessToken } from "@/lib/api/client.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const totalUsersQuery = useTotalUsers();
  const profileQuery = useUserProfileInfo();
  const totalProductsQuery = useTotalProducts();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [myProducts, setMyProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const checkOAuthSession = async () => {
      if (getAccessToken()) {
        setCheckingAuth(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        saveSessionTokens(session);
        window.location.reload();
      } else {
        navigate("/login");
      }
      setCheckingAuth(false);
    };
    checkOAuthSession();
  }, [navigate]);

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      navigate("/login");
    }
  }, [checkingAuth, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = getAccessToken();
      Promise.all([
        fetch(`${API_URL}/api/products/my/list`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      ]).then(([productsData, wishlistData]) => {
        setMyProducts(productsData.products || []);
        setWishlist(wishlistData.items || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId) => {
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
    } catch {
      // Silently handle errors
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Silently handle errors
    }
  };

  const stats = {
    products: totalProductsQuery.data ?? 0,
    users: totalUsersQuery.data ?? 0,
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[var(--pink-500)] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-black text-xl uppercase tracking-widest">Verifying...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* HEADER SECTION */}
          <div className="mb-12 border-b-4 border-black pb-6">
            <h1 className="font-black text-5xl md:text-6xl uppercase italic tracking-tighter mb-2">
              Welcome back, <span className="text-[var(--pink-500)] underline decoration-4 decoration-black underline-offset-4">{profileQuery.data?.name || user?.name || "Creator"}</span>
            </h1>
            <p className="text-xl font-bold text-gray-600 uppercase tracking-wide">Manage your empire, track your stash.</p>
          </div>

          {/* STATS GRID */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <StatCard icon={<BoxIcon />} label="Total Products" value={stats.products} color="bg-[var(--yellow-300)]" />
            <StatCard icon={<UsersIcon />} label="Total Users" value={stats.users} color="bg-[var(--mint)]" />
            <StatCard icon={<CurrencyIcon />} label="Revenue" value="₹0" color="bg-[var(--pink-300)]" />
            <StatCard icon={<ChartIcon />} label="This Month" value="₹0" color="bg-blue-300" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* PRODUCTS SECTION */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-0 overflow-hidden">
                <div className="bg-black text-white p-4 flex items-center justify-between">
                  <h2 className="font-black text-xl uppercase italic tracking-wider">Your Inventory</h2>
                  <button
                    onClick={() => navigate("/create-product")}
                    className="px-4 py-2 font-bold text-sm uppercase bg-[var(--yellow-400)] text-black border-2 border-transparent hover:border-white hover:bg-black hover:text-white transition-all"
                  >
                    + New Product
                  </button>
                </div>

                <div className="p-6">
                  {myProducts.length === 0 ? (
                    <div className="text-center py-12 border-3 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                         <BoxIcon />
                      </div>
                      <h3 className="font-black text-xl uppercase mb-2">No products yet</h3>
                      <p className="text-gray-600 font-bold mb-6">Create your first digital product and start selling!</p>
                      <button
                        onClick={() => navigate("/create-product")}
                        className="px-6 py-3 font-black uppercase bg-black text-white border-3 border-transparent hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0px_var(--gray-400)] transition-all"
                      >
                        Create Product
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProducts.slice(0, 5).map(product => (
                        <div 
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex items-center gap-4 p-4 border-3 border-black bg-white cursor-pointer hover:bg-[var(--yellow-100)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_var(--black)] transition-all group"
                        >
                          <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.thumbnail_url ? (
                              <img src={product.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <BoxIcon />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg uppercase truncate">{product.name}</h4>
                            <p className="text-xs font-bold text-gray-500 truncate">{product.short_description || product.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-xl text-[var(--pink-600)]">
                              {product.currency === 'INR' ? '₹' : '$'}{product.price}
                            </p>
                            <span className={`text-[10px] uppercase font-black px-2 py-1 border border-black ${product.is_active ? "bg-green-300" : "bg-gray-300"}`}>
                              {product.is_active ? "Active" : "Draft"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* WISHLIST SECTION */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-0 overflow-hidden">
                <div className="bg-[var(--pink-500)] text-white p-4 border-b-3 border-black">
                   <h2 className="font-black text-xl uppercase italic tracking-wider">Your Wishlist</h2>
                </div>
                
                <div className="p-6">
                  {wishlist.length === 0 ? (
                    <p className="text-center py-8 font-bold text-gray-400 uppercase">Your wishlist is empty</p>
                  ) : (
                    <div className="space-y-4">
                      {wishlist.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border-2 border-black bg-gray-50 hover:bg-white transition-colors">
                          <div 
                            className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/product/${item.product_id}`)}
                          >
                            {item.product?.thumbnail_url ? (
                              <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <BoxIcon />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/product/${item.product_id}`)}>
                            <h4 className="font-black text-sm uppercase truncate">{item.product?.name || "Product"}</h4>
                            <p className="text-sm font-bold text-[var(--pink-600)]">
                              {item.product?.currency === 'INR' ? '₹' : '$'}{item.product?.price}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { addToCart(item.product_id); removeFromWishlist(item.product_id); }}
                              className="p-2 bg-black text-white border-2 border-black hover:bg-[var(--mint)] hover:text-black transition-colors"
                              title="Add to cart"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.product_id)}
                              className="p-2 bg-white text-red-500 border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-8">
              
              {/* QUICK ACTIONS */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-6">
                <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/create-product")}
                    className="w-full py-3 font-bold uppercase border-2 border-black bg-[var(--yellow-400)] hover:bg-black hover:text-[var(--yellow-400)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Create Product
                  </button>
                  <button
                    onClick={() => navigate("/browse")}
                    className="w-full py-3 font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                    Browse Market
                  </button>
                  <button
                    onClick={() => navigate("/library")}
                    className="w-full py-3 font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    My Library
                  </button>
                </div>
              </div>

              {/* PROFILE CARD */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-6 relative">
                 <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2">User ID Card</h3>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-[var(--pink-100)] border-3 border-black rounded-full flex items-center justify-center text-3xl font-black">
                    {(profileQuery.data?.name || user?.name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-xl uppercase truncate max-w-[200px]">{profileQuery.data?.name || user?.name}</p>
                    <p className="text-sm font-bold text-gray-500 truncate max-w-[200px]">{profileQuery.data?.email || user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full py-2.5 font-bold uppercase border-2 border-black bg-gray-100 hover:bg-[var(--pink-500)] hover:text-white transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} border-3 border-black shadow-[6px_6px_0px_var(--black)] p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--black)] transition-all`}>
      <div className="flex items-center justify-between mb-2">
         <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white rounded-md">
           {icon}
         </div>
      </div>
      <p className="text-xs font-black uppercase tracking-wider mb-1 opacity-70">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function BoxIcon() {
  return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}

function UsersIcon() {
  return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
}

function CurrencyIcon() {
  return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function ChartIcon() {
  return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
}