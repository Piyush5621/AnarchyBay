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
                  {profile?.bio && (
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">{profile.bio}</p>
                  )}
                  {profile?.social_links && Object.keys(profile.social_links).filter(key => profile.social_links[key]).length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {profile.social_links.twitter && (
                        <a href={profile.social_links.twitter.startsWith('http') ? profile.social_links.twitter : `https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform" title="Twitter">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.github && (
                        <a href={profile.social_links.github.startsWith('http') ? profile.social_links.github : `https://github.com/${profile.social_links.github.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-[#181717] text-white rounded-full hover:scale-110 transition-transform" title="GitHub">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.linkedin && (
                        <a href={profile.social_links.linkedin.startsWith('http') ? profile.social_links.linkedin : `https://linkedin.com/in/${profile.social_links.linkedin.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:scale-110 transition-transform" title="LinkedIn">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.youtube && (
                        <a href={profile.social_links.youtube.startsWith('http') ? profile.social_links.youtube : `https://youtube.com/@${profile.social_links.youtube.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-[#FF0000] text-white rounded-full hover:scale-110 transition-transform" title="YouTube">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.facebook && (
                        <a href={profile.social_links.facebook.startsWith('http') ? profile.social_links.facebook : `https://facebook.com/${profile.social_links.facebook.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:scale-110 transition-transform" title="Facebook">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.tiktok && (
                        <a href={profile.social_links.tiktok.startsWith('http') ? profile.social_links.tiktok : `https://tiktok.com/@${profile.social_links.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform" title="TikTok">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </a>
                      )}
                      {profile.social_links.instagram && (
                        <a href={profile.social_links.instagram.startsWith('http') ? profile.social_links.instagram : `https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white rounded-full hover:scale-110 transition-transform" title="Instagram">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {profile.social_links.website && (
                        <a href={profile.social_links.website.startsWith('http') ? profile.social_links.website : `https://${profile.social_links.website}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-[#6366F1] text-white rounded-full hover:scale-110 transition-transform" title="Website">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-4">{user?.email || profile?.email}</p>
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
                        {profile?.social_links && Object.keys(profile.social_links).filter(key => profile.social_links[key]).length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-bold mb-3">Social Links</h3>
                            <div className="flex flex-wrap gap-3">
                              {profile.social_links.twitter && (
                                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                  Twitter
                                </a>
                              )}
                              {profile.social_links.github && (
                                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#181717] text-white border-2 border-black hover:bg-[#24292e] transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                  </svg>
                                  GitHub
                                </a>
                              )}
                              {profile.social_links.linkedin && (
                                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white border-2 border-black hover:bg-[#004182] transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                  LinkedIn
                                </a>
                              )}
                              {profile.social_links.youtube && (
                                <a href={profile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white border-2 border-black hover:bg-[#cc0000] transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                  </svg>
                                  YouTube
                                </a>
                              )}
                              {profile.social_links.facebook && (
                                <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white border-2 border-black hover:bg-[#0c63d4] transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                  </svg>
                                  Facebook
                                </a>
                              )}
                              {profile.social_links.instagram && (
                                <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white border-2 border-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  Instagram
                                </a>
                              )}
                              {profile.social_links.tiktok && (
                                <a href={profile.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                  </svg>
                                  TikTok
                                </a>
                              )}
                              {profile.social_links.website && (
                                <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white border-2 border-black hover:bg-[#4f46e5] transition-colors font-bold text-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                  </svg>
                                  Website
                                </a>
                              )}
                            </div>
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
