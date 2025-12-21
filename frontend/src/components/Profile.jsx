import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import useUserProfileInfo from '@/hooks/profile/use-user-profile-info';
import useTotalProducts from '@/hooks/products/use-total-products';
import NavBar from './NavBar';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/api/client';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getMyProducts } from '@/services/products/product.service';
import { 
  Edit, ExternalLink, Package, Heart, 
  ShoppingBag, Trash2, X 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- HELPER: Social Media Icons ---
const getPlatformDetails = (url) => {
  const lowerUrl = url ? url.toLowerCase() : '';
  
  if (lowerUrl.includes('github')) return { name: 'GitHub', icon: <GithubIcon />, color: 'bg-gray-900 text-white', border: 'border-gray-900' };
  if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return { name: 'X (Twitter)', icon: <TwitterIcon />, color: 'bg-black text-white', border: 'border-black' };
  if (lowerUrl.includes('linkedin')) return { name: 'LinkedIn', icon: <LinkedinIcon />, color: 'bg-[#0077b5] text-white', border: 'border-[#0077b5]' };
  if (lowerUrl.includes('instagram')) return { name: 'Instagram', icon: <InstagramIcon />, color: 'bg-gradient-to-tr from-yellow-400 to-purple-600 text-white', border: 'border-purple-600' };
  if (lowerUrl.includes('youtube')) return { name: 'YouTube', icon: <YoutubeIcon />, color: 'bg-red-600 text-white', border: 'border-red-600' };
  if (lowerUrl.includes('facebook')) return { name: 'Facebook', icon: <FacebookIcon />, color: 'bg-[#1877F2] text-white', border: 'border-[#1877F2]' };
  
  return { name: 'Website', icon: <GlobeIcon />, color: 'bg-gray-100 text-black', border: 'border-black' };
};

// Simple SVG Icons
const GithubIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
const TwitterIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
const InstagramIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.585-.011-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const YoutubeIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
const FacebookIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
const GlobeIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>;

export default function Profile() {
  const navigate = useNavigate(); // For navigation
  const { isAuthenticated, user, role } = useAuth();
  const profileQuery = useUserProfileInfo();
  const productsQuery = useTotalProducts();
  
  const [activeTab, setActiveTab] = useState('info');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const loading = (!isAuthenticated) || profileQuery.isLoading || productsQuery.isLoading;
  const profile = profileQuery.data || null;
  const stats = { totalSales: 0, products: productsQuery.data ?? 0, revenue: 0 };
  const isSeller = role === 'seller' || role === 'creator' || role === 'admin';
  const socialLinks = profile?.social_links || [];

  // --- Effects ---
  useEffect(() => {
    if (activeTab === 'wishlist' && isAuthenticated) fetchWishlist();
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'products' && isAuthenticated && isSeller) fetchMyProducts();
  }, [activeTab, isAuthenticated, isSeller]);

  // --- API Handlers ---
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

  const displayName = profile?.display_name || profile?.name || user?.name || 'Your Name';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-black border-t-[var(--pink-500)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <NavBar />

      {/* Decorative Background Element */}
      <div className="fixed top-0 left-0 w-full h-[300px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 opacity-70"></div>

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN: ID CARD ================= */}
            <div className="md:col-span-4 lg:col-span-3 sticky top-24">
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden relative">
                
                {/* Hole Punch Design */}
                <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#faf9f6] rounded-full border-[3px] border-black z-10"></div>
                
                {/* ID Header Pattern */}
                <div className="h-32 bg-[var(--pink-500)] relative border-b-[3px] border-black overflow-hidden">
                   <div className="absolute inset-0 bg-[image:radial-gradient(circle,rgba(0,0,0,0.15)_2px,transparent_2px)] bg-[size:8px_8px]"></div>
                </div>

                <div className="px-6 pb-6 text-center relative">
                  {/* Profile Picture */}
                  <div className="-mt-16 mb-4 inline-block relative group">
                    <div className="w-32 h-32 rounded-full bg-white border-[3px] border-black flex items-center justify-center text-4xl font-black overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105 group-hover:rotate-2">
                      {profile?.profile_image_url ? (
                        <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">{displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <h2 className="font-black text-2xl leading-none uppercase tracking-tight">{displayName}</h2>
                  {profile?.username && (
                    <p className="text-gray-500 font-bold text-sm mt-1">@{profile.username}</p>
                  )}
                  
                  <div className="mt-4 flex justify-center gap-2">
                     <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase border-2 border-black ${isSeller ? 'bg-[var(--mint)]' : 'bg-blue-200'}`}>
                       {role || 'customer'}
                     </span>
                     <span className="inline-block px-3 py-1 text-[10px] font-black uppercase border-2 border-black bg-gray-100">
                        {new Date().getFullYear()}
                     </span>
                  </div>

                  {/* Sidebar Navigation Buttons */}
                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={() => setActiveTab('info')}
                      className={`w-full py-3 px-4 font-black text-sm uppercase flex items-center gap-3 border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-1 ${activeTab === 'info' ? 'bg-[var(--yellow-400)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <Package className="w-4 h-4" /> My Profile
                    </button>
                    
                    {isSeller && (
                      <button 
                        onClick={() => setActiveTab('products')}
                        className={`w-full py-3 px-4 font-black text-sm uppercase flex items-center gap-3 border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-1 ${activeTab === 'products' ? 'bg-[var(--yellow-400)]' : 'bg-white hover:bg-gray-50'}`}
                      >
                         <ShoppingBag className="w-4 h-4" /> My Products
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setActiveTab('wishlist')}
                      className={`w-full py-3 px-4 font-black text-sm uppercase flex items-center gap-3 border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-1 ${activeTab === 'wishlist' ? 'bg-[var(--yellow-400)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: CONTENT ================= */}
            <div className="md:col-span-8 lg:col-span-9 space-y-8">
              
              {/* --- PROFILE INFO TAB --- */}
              {activeTab === 'info' && (
                <>
                 {/* Top Stats Bar (Only if Seller) */}
                 {isSeller && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_black] hover:-translate-y-1 transition-transform">
                         <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Total Revenue</div>
                         <div className="text-2xl font-black">₹{stats.revenue}</div>
                      </div>
                      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_black] hover:-translate-y-1 transition-transform">
                         <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Products</div>
                         <div className="text-2xl font-black">{stats.products}</div>
                      </div>
                      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_black] hover:-translate-y-1 transition-transform">
                         <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Sales</div>
                         <div className="text-2xl font-black">{stats.totalSales}</div>
                      </div>
                    </div>
                 )}

                 {/* Main Content Card */}
                 <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 relative min-h-[400px]">
                    
                    {/* View Mode */}
                    <div className="flex justify-between items-start mb-6 border-b-[3px] border-black pb-4">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">About Me</h2>
                        
                        {/* THE EDIT BUTTON - Navigates to /settings/profile */}
                        <button 
                            onClick={() => navigate('/settings/profile')}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--pink-500)] text-white border-[3px] border-black font-bold uppercase text-xs shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] hover:-translate-y-1 transition-all"
                        >
                            <Edit className="w-3 h-3" /> Edit Profile
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none mb-8 text-black">
                        {profile?.bio ? (
                            <p className="whitespace-pre-line leading-relaxed font-medium">{profile.bio}</p>
                        ) : (
                            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 text-center">
                            <p className="text-gray-400 font-bold uppercase italic">No bio description yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Social Links View */}
                    <div className="mt-8">
                        <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" /> Social Connections
                        </h3>
                        {socialLinks.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                            {socialLinks.map((link, idx) => {
                                const details = getPlatformDetails(link.url || link);
                                return (
                                <a 
                                    key={idx}
                                    href={link.url || link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-4 py-3 border-2 border-black font-bold text-sm uppercase transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_black] ${details.color}`}
                                >
                                    {details.icon} <span>{details.name}</span>
                                </a>
                                )
                            })}
                            </div>
                        ) : (
                        <p className="text-sm text-gray-500 italic">No social links added.</p>
                        )}
                    </div>
                 </div>
                </>
              )}

              {/* --- PRODUCTS TAB (Seller Only) --- */}
              {activeTab === 'products' && isSeller && (
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 min-h-[500px]">
                   <div className="flex justify-between items-center mb-8 border-b-[3px] border-black pb-4">
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">My Products</h2>
                      <Link to="/create-product" className="px-5 py-2 bg-[var(--yellow-400)] text-black border-[3px] border-black font-black uppercase text-xs shadow-[3px_3px_0px_black] hover:-translate-y-1 transition-all">
                        + New Product
                      </Link>
                   </div>
                   
                   {loadingProducts ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                         {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 border-[3px] border-gray-300"></div>)}
                      </div>
                   ) : myProducts.length === 0 ? (
                      <div className="text-center py-20 border-[3px] border-dashed border-gray-300 bg-gray-50">
                         <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                         <p className="font-bold text-gray-400 uppercase">You haven't created any products yet.</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {myProducts.map((p) => (
                           <div key={p.id} className="group border-[3px] border-black bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] transition-all duration-200 flex flex-col">
                              <div className="h-32 bg-gray-100 border-b-[3px] border-black relative overflow-hidden">
                                 {p.thumbnail_url ? (
                                    <img src={p.thumbnail_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-8 h-8"/></div>
                                 )}
                                 <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black ${p.is_active ? 'bg-[var(--mint)]' : 'bg-red-200'}`}>
                                    {p.is_active ? 'Active' : 'Draft'}
                                 </div>
                              </div>
                              <div className="p-4 flex-1 flex flex-col">
                                 <h3 className="font-black text-lg leading-tight mb-1 line-clamp-1">{p.name}</h3>
                                 <p className="text-gray-500 text-xs font-bold uppercase mb-4">{p.currency === 'INR' ? '₹' : '$'}{p.price}</p>
                                 <div className="mt-auto flex gap-2">
                                    <Link to={`/edit-product/${p.id}`} className="flex-1 py-2 text-center border-2 border-black font-bold uppercase text-xs hover:bg-[var(--yellow-400)] transition-colors">Edit</Link>
                                    <button onClick={() => deleteProduct(p.id)} className="px-3 border-2 border-black hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   )}
                </div>
              )}

              {/* --- WISHLIST TAB --- */}
              {activeTab === 'wishlist' && (
                 <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 min-h-[500px]">
                    <div className="flex justify-between items-center mb-8 border-b-[3px] border-black pb-4">
                       <h2 className="text-3xl font-black uppercase italic tracking-tighter">Your Wishlist</h2>
                    </div>
                    {wishlistItems.length === 0 ? (
                       <div className="text-center py-20 border-[3px] border-dashed border-gray-300 bg-gray-50">
                          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <p className="font-bold text-gray-400 uppercase">Your wishlist is empty.</p>
                          <Link to="/browse" className="inline-block mt-4 text-xs font-black uppercase underline decoration-2">Start Browsing</Link>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {wishlistItems.map((item) => (
                             <div key={item.id} className="border-[3px] border-black bg-[var(--pink-50)] p-4 flex gap-4 items-center shadow-[4px_4px_0px_black]">
                                <div className="w-16 h-16 bg-white border-2 border-black flex-shrink-0">
                                   {item.product?.thumbnail_url && <img src={item.product.thumbnail_url} className="w-full h-full object-cover"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <Link to={`/product/${item.product_id}`} className="font-black text-sm uppercase hover:underline line-clamp-1">{item.product?.name}</Link>
                                   <p className="text-xs font-bold text-gray-500">₹{item.product?.price}</p>
                                </div>
                                <button onClick={() => removeFromWishlist(item.product_id)} className="p-2 border-2 border-black hover:bg-red-200 text-red-600 transition-colors">
                                   <X className="w-4 h-4" />
                                </button>
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