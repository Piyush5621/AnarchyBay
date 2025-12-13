import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import useUserProfileInfo from '@/hooks/profile/use-user-profile-info';
import useTotalProducts from '@/hooks/products/use-total-products';
import NavBar from './NavBar';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/api/client';
import { Link } from 'react-router-dom';
import { getMyProducts } from '@/services/products/product.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Profile() {
  const { isAuthenticated, user, role } = useAuth();
  const profileQuery = useUserProfileInfo();
  const productsQuery = useTotalProducts();
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    display_name: '',
    bio: '',
  });
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const loading = (!isAuthenticated) || profileQuery.isLoading || productsQuery.isLoading;
  const profile = profileQuery.data || null;
  const stats = { totalSales: 0, products: productsQuery.data ?? 0, revenue: 0 };
  const isSeller = role === 'seller' || role === 'creator';

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (formData.username && formData.username !== profile?.username) {
      const timer = setTimeout(async () => {
        setCheckingUsername(true);
        try {
          const token = getAccessToken();
          const res = await fetch(
            `${API_URL}/api/profile/check-username/${formData.username}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          const data = await res.json();
          setUsernameAvailable(data.available);
        } catch {
          setUsernameAvailable(true);
        } finally {
          setCheckingUsername(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(true);
    }
  }, [formData.username, profile?.username]);

  useEffect(() => {
    if (activeTab === 'wishlist' && isAuthenticated) {
      fetchWishlist();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'products' && isAuthenticated && isSeller) {
      fetchMyProducts();
    }
  }, [activeTab, isAuthenticated, isSeller]);

  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await getMyProducts();
      setMyProducts(data.products || []);
    } catch {
      toast.error('Failed to load your products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setMyProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted');
      productsQuery.refetch();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlistItems(data.items || []);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleSave = async () => {
    if (!usernameAvailable) {
      toast.error('Username is not available');
      return;
    }

    setSaving(true);
    try {
      const token = getAccessToken();
      const res = await fetch(
        `${API_URL}/api/profile/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username || null,
            display_name: formData.display_name || null,
            bio: formData.bio || null,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated!');
      setEditing(false);
      profileQuery.refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.display_name || profile?.name || user?.name || 'Your Name';

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-black mb-8">Profile Settings</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[var(--pink-200)] border-4 border-black flex items-center justify-center text-4xl font-black overflow-hidden">
                    {profile?.profile_image_url ? (
                      <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h2 className="mt-4 font-black text-xl">{displayName}</h2>
                  {profile?.username && (
                    <p className="text-gray-500">@{profile.username}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{user?.email || profile?.email}</p>
                  <span className={`inline-block mt-3 px-4 py-1 text-sm font-bold uppercase border-2 border-black ${isSeller ? 'bg-[var(--mint)]' : 'bg-[var(--pink-100)]'}`}>
                    {role || 'customer'}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`w-full py-3 font-bold text-left px-4 border-3 transition-all ${activeTab === 'info' ? 'bg-[var(--pink-500)] text-white border-black shadow-[3px_3px_0px_var(--black)]' : 'bg-white border-transparent hover:bg-[var(--pink-50)]'}`}
                  >
                    Account Info
                  </button>
                  {isSeller && (
                    <button 
                      onClick={() => setActiveTab('products')}
                      className={`w-full py-3 font-bold text-left px-4 border-3 transition-all ${activeTab === 'products' ? 'bg-[var(--pink-500)] text-white border-black shadow-[3px_3px_0px_var(--black)]' : 'bg-white border-transparent hover:bg-[var(--pink-50)]'}`}
                    >
                      Your Products
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full py-3 font-bold text-left px-4 border-3 transition-all ${activeTab === 'wishlist' ? 'bg-[var(--pink-500)] text-white border-black shadow-[3px_3px_0px_var(--black)]' : 'bg-white border-transparent hover:bg-[var(--pink-50)]'}`}
                  >
                    Wishlist
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              {activeTab === 'info' && (
                <>
                  {loading ? (
                    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8 animate-pulse">
                      <div className="h-8 bg-gray-200 w-1/3 mb-6" />
                      <div className="space-y-4">
                        <div className="h-12 bg-gray-200" />
                        <div className="h-12 bg-gray-200" />
                        <div className="h-24 bg-gray-200" />
                      </div>
                    </div>
                  ) : editing ? (
                    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                      <h2 className="text-xl font-black mb-6">Edit Your Profile</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block font-bold mb-2">Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-[var(--pink-500)]"
                            placeholder="Your full name"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-2">Username</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                            <input
                              type="text"
                              value={formData.username}
                              onChange={e => setFormData(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                              className={`w-full pl-10 pr-4 py-3 border-3 focus:outline-none focus:ring-2 focus:ring-[var(--pink-500)] ${
                                formData.username && !checkingUsername && !usernameAvailable ? 'border-red-500' : 'border-black'
                              }`}
                              placeholder="username"
                            />
                          </div>
                          {formData.username && (
                            <p className={`text-sm mt-1 ${usernameAvailable ? 'text-green-600' : 'text-red-500'}`}>
                              {checkingUsername ? 'Checking...' : usernameAvailable ? 'Username available!' : 'Username taken'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block font-bold mb-2">Display Name</label>
                          <input
                            type="text"
                            value={formData.display_name}
                            onChange={e => setFormData(f => ({ ...f, display_name: e.target.value }))}
                            className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-[var(--pink-500)]"
                            placeholder="How you want to be displayed"
                          />
                          <p className="text-sm text-gray-500 mt-1">This will be shown on your products and reviews</p>
                        </div>

                        <div>
                          <label className="block font-bold mb-2">Bio</label>
                          <textarea
                            value={formData.bio}
                            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-[var(--pink-500)]"
                            placeholder="Tell others about yourself..."
                          />
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={handleSave}
                            disabled={saving || !usernameAvailable}
                            className="flex-1 py-3 font-black uppercase bg-[var(--mint)] text-black border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button 
                            onClick={() => setEditing(false)}
                            className="px-6 py-3 font-bold uppercase bg-white text-black border-3 border-black shadow-[4px_4px_0px_var(--black)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-black">Account Info</h2>
                          <button 
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 font-bold uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--black)] transition-all text-sm"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b border-dashed border-gray-200">
                            <span className="font-bold">Name</span>
                            <span className="text-gray-600">{profile?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dashed border-gray-200">
                            <span className="font-bold">Username</span>
                            <span className="text-gray-600">{profile?.username ? `@${profile.username}` : '-'}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dashed border-gray-200">
                            <span className="font-bold">Display Name</span>
                            <span className="text-gray-600">{profile?.display_name || '-'}</span>
                          </div>
                          <div className="flex justify-between py-3">
                            <span className="font-bold">Email</span>
                            <span className="text-gray-600">{profile?.email || '-'}</span>
                          </div>
                        </div>
                        {profile?.bio && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-bold mb-2">Bio</h3>
                            <p className="text-gray-600">{profile.bio}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                        <h2 className="text-xl font-black mb-6">{isSeller ? 'Store Stats' : 'Account Stats'}</h2>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[var(--pink-50)] border-3 border-black p-4 text-center">
                            <div className="text-3xl font-black text-[var(--pink-600)]">{stats.products}</div>
                            <div className="text-sm font-bold uppercase">Products</div>
                          </div>
                          <div className="bg-[var(--mint)] border-3 border-black p-4 text-center">
                            <div className="text-3xl font-black">{stats.totalSales}</div>
                            <div className="text-sm font-bold uppercase">Sales</div>
                          </div>
                          <div className="bg-[var(--yellow-400)] border-3 border-black p-4 text-center">
                            <div className="text-3xl font-black">₹{stats.revenue}</div>
                            <div className="text-sm font-bold uppercase">Revenue</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'products' && isSeller && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black">Your Products</h2>
                    <Link
                      to="/create-product"
                      className="px-4 py-2 font-bold uppercase bg-[var(--mint)] text-black border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--black)] transition-all text-sm"
                    >
                      + New Product
                    </Link>
                  </div>
                  
                  {loadingProducts ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 border-3 border-black" />
                      ))}
                    </div>
                  ) : myProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="font-black text-xl mb-2">No products yet</h3>
                      <p className="text-gray-600 mb-6">Start selling by creating your first product</p>
                      <Link
                        to="/create-product"
                        className="inline-block px-6 py-3 font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
                      >
                        Create Product
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProducts.map((product) => (
                        <div key={product.id} className="border-3 border-black p-4 flex gap-4 bg-[var(--pink-50)]">
                          <Link to={`/product/${product.id}`} className="w-20 h-20 flex-shrink-0 bg-white border-3 border-black overflow-hidden">
                            {product.thumbnail_url ? (
                              <img src={product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${product.id}`} className="font-black text-lg hover:text-[var(--pink-500)] transition-colors line-clamp-1">
                              {product.name}
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{product.short_description || product.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3">
                                <span className="font-black text-lg text-[var(--pink-600)]">
                                  {product.currency === 'INR' ? '₹' : '$'}{product.price || 0}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-bold uppercase border-2 border-black ${product.is_active ? 'bg-[var(--mint)]' : 'bg-gray-200'}`}>
                                  {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  to={`/edit-product/${product.id}`}
                                  className="px-3 py-1 font-bold text-sm uppercase bg-white text-black border-2 border-black hover:bg-[var(--yellow-400)] transition-colors"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="px-3 py-1 font-bold text-sm uppercase bg-white text-red-600 border-2 border-black hover:bg-red-100 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-8">
                  <h2 className="text-xl font-black mb-6">Your Wishlist</h2>
                  
                  {loadingWishlist ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 border-3 border-black" />
                      ))}
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">💝</div>
                      <h3 className="font-black text-xl mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-6">Save products you like to purchase later</p>
                      <Link
                        to="/browse"
                        className="inline-block px-6 py-3 font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="border-3 border-black p-4 flex gap-4 bg-[var(--pink-50)]">
                          <Link to={`/product/${item.product_id}`} className="w-20 h-20 flex-shrink-0 bg-white border-3 border-black overflow-hidden">
                            {item.product?.thumbnail_url ? (
                              <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.product_id}`} className="font-black text-lg hover:text-[var(--pink-500)] transition-colors line-clamp-1">
                              {item.product?.name || 'Product'}
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{item.product?.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-black text-lg text-[var(--pink-600)]">
                                {item.product?.currency === 'INR' ? '₹' : '$'}{item.product?.price || 0}
                              </span>
                              <button
                                onClick={() => removeFromWishlist(item.product_id)}
                                className="px-3 py-1 font-bold text-sm uppercase bg-white text-black border-2 border-black hover:bg-[var(--pink-200)] transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}