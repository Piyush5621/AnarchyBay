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
          <svg className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-medium text-slate-600">Verifying...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl mb-2">
              Welcome back, {profileQuery.data?.name || user?.name || "Creator"}
            </h1>
            <p className="text-lg text-slate-500">Manage your products and track your sales.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={<BoxIcon />} label="Total Products" value={stats.products} />
            <StatCard icon={<UsersIcon />} label="Total Users" value={stats.users} />
            <StatCard icon={<CurrencyIcon />} label="Revenue" value="₹0" />
            <StatCard icon={<ChartIcon />} label="This Month" value="₹0" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-xl">Your Products</h2>
                  <button
                    onClick={() => navigate("/create-product")}
                    className="px-4 py-2 font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    New Product
                  </button>
                </div>

                {myProducts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="font-semibold text-lg mb-2">No products yet</h3>
                    <p className="text-slate-500 mb-6">Create your first digital product and start selling!</p>
                    <button
                      onClick={() => navigate("/create-product")}
                      className="px-5 py-2.5 font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      Create Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myProducts.slice(0, 5).map(product => (
                      <div 
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-sm text-slate-500 truncate">{product.short_description || product.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {product.currency === 'INR' ? '₹' : '$'}{product.price}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                            {product.is_active ? "Active" : "Draft"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-xl mb-4">Wishlist</h2>
                {wishlist.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">Your wishlist is empty</p>
                ) : (
                  <div className="space-y-3">
                    {wishlist.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-200">
                        <div 
                          className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/product/${item.product_id}`)}
                        >
                          {item.product?.thumbnail_url ? (
                            <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/product/${item.product_id}`)}>
                          <h4 className="font-medium text-sm truncate">{item.product?.name || "Product"}</h4>
                          <p className="text-sm font-semibold text-slate-700">
                            {item.product?.currency === 'INR' ? '₹' : '$'}{item.product?.price}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { addToCart(item.product_id); removeFromWishlist(item.product_id); }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Add to cart"
                          >
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.product_id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/create-product")}
                    className="w-full py-3 font-medium rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Create Product
                  </button>
                  <button
                    onClick={() => navigate("/browse")}
                    className="w-full py-3 font-medium rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                    Browse Marketplace
                  </button>
                  <button
                    onClick={() => navigate("/library")}
                    className="w-full py-3 font-medium rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    My Library
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-semibold">
                      {(profileQuery.data?.name || user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{profileQuery.data?.name || user?.name}</p>
                      <p className="text-sm text-slate-500">{profileQuery.data?.email || user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full py-2.5 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
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

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 mb-3">
        {icon}
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function BoxIcon() {
  return <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}

function UsersIcon() {
  return <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
}

function CurrencyIcon() {
  return <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function ChartIcon() {
  return <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
}