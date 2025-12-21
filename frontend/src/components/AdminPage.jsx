import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { 
  Users, Package, ShoppingCart, DollarSign, 
  Mail, Search, Shield, Ban, CheckCircle, 
  MessageSquare, ChevronRight 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  
  const [contactFilter, setContactFilter] = useState("all"); 

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'admin')) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isAuthenticated, role, loading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeTab]);

  const toggleMessage = (id) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
  };

  const filteredContacts = contacts.filter((msg) => {
    if (contactFilter === "pending") return !msg.replied_at;
    if (contactFilter === "replied") return msg.replied_at;
    return true;
  });

  const fetchData = async () => {
    setDataLoading(true);
    const token = getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (activeTab === "overview" || activeTab === "users" || activeTab === "products") {
        const statsRes = await fetch(`${API_URL}/api/admin/stats`, { headers });
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData);
      }

      if (activeTab === "users") {
        const usersRes = await fetch(`${API_URL}/api/admin/users`, { headers });
        const usersData = await usersRes.json();
        if (usersRes.ok) setUsers(usersData.users || []);
      }

      if (activeTab === "products") {
        const productsRes = await fetch(`${API_URL}/api/admin/products`, { headers });
        const productsData = await productsRes.json();
        if (productsRes.ok) setProducts(productsData.products || []);
      }
      if (activeTab === "contacts") {
        const res = await fetch(`${API_URL}/api/admin/contact-messages`, {
          headers,
        });
        const data = await res.json();
        if (res.ok) setContacts(data.messages || []);
      }

    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setDataLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        toast.success("Role updated");
        fetchData();
      } else {
        toast.error("Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    }
  };

  const toggleFeatured = async (productId, isFeatured) => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !isFeatured })
      });
      if (res.ok) {
        toast.success("Product updated");
        fetchData();
      }
    } catch {
      toast.error("Error updating product");
    }
  };

  const deactivateProduct = async (productId) => {
    if (!confirm("Are you sure you want to deactivate (BAN) this product?")) return;
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Product deactivated");
        fetchData();
      }
    } catch {
      toast.error("Error deactivating product");
    }
  };

  const reactivateProduct = async (productId) => {
    if (!confirm("Are you sure you want to reactivate (UNBAN) this product?")) return;
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${productId}/activate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Product reactivated");
        fetchData();
      } else {
        toast.error("Failed to reactivate. Check server routes.");
      }
    } catch {
      toast.error("Error reactivating product");
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    const token = getAccessToken();

    try {
      const res = await fetch(
        `${API_URL}/api/admin/contact-messages/${id}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ replyMessage: replyText }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Reply sent ✉️");
      setReplyModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to send reply");
    }
  };


  if (loading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-black border-t-[var(--pink-500)] rounded-full animate-spin"></div>
          <p className="font-black uppercase tracking-widest text-xl">Loading Admin Panel...</p>
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
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider">
                  System Admin
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-500 uppercase">Live</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                Command <span className="text-[var(--pink-500)]">Center</span>
              </h1>
            </div>
            
            <div className="flex gap-2">
               {["overview", "users", "products", "contacts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-6 py-3 font-black uppercase text-sm md:text-base border-3 border-black transition-all transform hover:-translate-y-1 ${
                    activeTab === tab
                      ? "bg-[var(--yellow-400)] shadow-[4px_4px_0px_black]"
                      : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_gray]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-black border-t-[var(--pink-500)] rounded-full mx-auto mb-6" />
              <p className="font-black text-xl uppercase">Fetching Data...</p>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && stats && (
                <div className="space-y-8 animate-fade-in-up">
                  {/* STAT CARDS */}
                  <div className="grid md:grid-cols-4 gap-6">
                    <StatCard 
                      title="Total Users" 
                      value={stats.stats.totalUsers} 
                      icon={<Users className="w-6 h-6" />} 
                      color="bg-[var(--mint)]" 
                    />
                    <StatCard 
                      title="Total Products" 
                      value={stats.stats.totalProducts} 
                      icon={<Package className="w-6 h-6" />} 
                      color="bg-[var(--yellow-300)]" 
                    />
                    <StatCard 
                      title="Total Sales" 
                      value={stats.stats.totalPurchases} 
                      icon={<ShoppingCart className="w-6 h-6" />} 
                      color="bg-blue-300" 
                    />
                    <StatCard 
                      title="Total Revenue" 
                      value={`₹${stats.stats.totalRevenue.toLocaleString()}`} 
                      icon={<DollarSign className="w-6 h-6" />} 
                      color="bg-[var(--pink-300)]" 
                    />
                  </div>

                  {/* RECENT LISTS */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] overflow-hidden">
                      <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="font-black text-xl uppercase">New Users</h3>
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="divide-y-2 divide-gray-100">
                        {stats.recentUsers?.slice(0, 5).map((user) => (
                          <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold border-2 border-black">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{user.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-black uppercase border border-black ${
                              user.role === 'admin' ? 'bg-red-200' : 
                              user.role === 'seller' ? 'bg-blue-200' : 'bg-gray-100'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setActiveTab("users")} className="w-full py-3 text-center font-bold text-sm uppercase hover:bg-gray-100 border-t-2 border-black">
                        View All Users
                      </button>
                    </div>

                    {/* Recent Products */}
                    <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] overflow-hidden">
                      <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="font-black text-xl uppercase">New Products</h3>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="divide-y-2 divide-gray-100">
                        {stats.topProducts?.slice(0, 5).map((product) => (
                          <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[var(--yellow-100)] rounded-md flex items-center justify-center font-bold border-2 border-black">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-sm truncate max-w-[150px]">{product.name}</p>
                                <p className="text-xs text-gray-500 font-medium">by {product.profiles?.name || 'Unknown'}</p>
                              </div>
                            </div>
                            <span className="font-black text-lg">
                              ₹{product.price}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setActiveTab("products")} className="w-full py-3 text-center font-bold text-sm uppercase hover:bg-gray-100 border-t-2 border-black">
                        View All Products
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] overflow-hidden animate-fade-in-up">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-3 border-black">
                        <tr>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">User</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Joined</th>
                          <th className="px-6 py-4 text-right font-black uppercase text-sm tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-100">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-[var(--pink-50)] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                  {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{user.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className={`px-3 py-1 font-bold text-xs uppercase border-2 border-black cursor-pointer outline-none focus:shadow-[2px_2px_0px_black] ${
                                  user.role === 'admin' ? 'bg-red-100' : 
                                  user.role === 'seller' ? 'bg-blue-100' : 'bg-white'
                                }`}
                              >
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                                <option value="creator">Creator</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/seller/${user.id}`);
                                }}
                                className="px-3 py-1.5 text-xs font-bold uppercase bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === "products" && (
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] overflow-hidden animate-fade-in-up">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-3 border-black">
                        <tr>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Creator</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-black uppercase text-sm tracking-wider">Featured</th>
                          <th className="px-6 py-4 text-right font-black uppercase text-sm tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-100">
                        {products.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                              <p className="font-bold text-gray-500 uppercase">No products found</p>
                            </td>
                          </tr>
                        )}
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-[var(--pink-50)] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-black text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{product.profiles?.name || 'Unknown'}</span>
                                <span className="text-xs text-gray-500">{product.profiles?.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-black text-lg">
                                {product.currency === 'INR' ? '₹' : '$'}{product.price}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-[10px] font-black uppercase border border-black ${
                                product.is_active ? "bg-green-300" : "bg-red-300"
                              }`}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleFeatured(product.id, product.is_featured)}
                                className={`px-3 py-1 font-bold text-[10px] uppercase border border-black transition-all ${
                                  product.is_featured
                                    ? "bg-[var(--yellow-400)] shadow-[2px_2px_0px_black]"
                                    : "bg-white hover:bg-gray-100"
                                }`}
                              >
                                {product.is_featured ? "★ Featured" : "☆ Feature"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => navigate(`/product/${product.id}`)}
                                  className="p-2 border-2 border-black hover:bg-[var(--mint)] transition-colors"
                                  title="View"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                                
                                {product.is_active ? (
                                  <button
                                    onClick={() => deactivateProduct(product.id)}
                                    className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
                                    title="Ban Product"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => reactivateProduct(product.id)}
                                    className="p-2 border-2 border-black hover:bg-green-500 hover:text-white transition-colors"
                                    title="Unban Product"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === "contacts" && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Message Header */}
                  <div className="bg-[var(--pink-100)] border-3 border-black p-4 shadow-[4px_4px_0px_black] flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-black text-xl uppercase flex items-center gap-2">
                      <Mail className="w-6 h-6" />
                      Inbox
                      <span className="bg-black text-white text-sm px-2 py-0.5 rounded-full">
                        {filteredContacts.length}
                      </span>
                    </h3>

                    <div className="flex bg-white border-2 border-black p-1 gap-1">
                      {['all', 'pending', 'replied'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setContactFilter(filter)}
                          className={`px-4 py-1 text-xs font-black uppercase transition-all ${
                            contactFilter === filter
                              ? "bg-black text-white"
                              : "bg-transparent text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empty State */}
                  {filteredContacts.length === 0 && (
                    <div className="bg-white border-3 border-black p-12 text-center shadow-[4px_4px_0px_black]">
                      <Mail className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="font-bold text-gray-500 uppercase">No messages found</p>
                    </div>
                  )}

                  {/* Message Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredContacts.map((msg) => {
                      const isExpanded = expandedMessageId === msg.id;
                      const isLongMessage = msg.message.length > 120;

                      return (
                        <div
                          key={msg.id}
                          className="bg-white border-3 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all flex flex-col"
                        >
                          {/* Card Header */}
                          <div className="p-4 border-b-3 border-black bg-gray-50 flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-lg">{msg.name}</h4>
                              <p className="text-xs font-bold text-gray-500">{msg.email}</p>
                            </div>
                            <span className="text-[10px] font-black border border-black px-2 py-1 bg-white uppercase">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1">
                            <div className="mb-4">
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Subject</span>
                              <p className="font-bold text-base leading-tight">{msg.subject || "(No Subject)"}</p>
                            </div>

                            <div className="bg-[var(--yellow-100)] border-2 border-black p-3 relative">
                              <MessageSquare className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-black p-1 rounded-full text-black" />
                              <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                                {isExpanded || !isLongMessage ? msg.message : `${msg.message.substring(0, 120)}...`}
                              </p>
                              {isLongMessage && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleMessage(msg.id); }}
                                  className="mt-2 text-xs font-black uppercase underline decoration-2 hover:text-[var(--pink-600)]"
                                >
                                  {isExpanded ? "Show Less" : "Read More"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="p-4 border-t-3 border-black bg-gray-50 flex items-center justify-between">
                            {msg.replied_at ? (
                              <div className="flex items-center gap-2 text-green-700 bg-green-100 px-2 py-1 border border-green-700 rounded-md">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-black uppercase">Replied</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-yellow-700 bg-[var(--yellow-100)] px-2 py-1 border border-yellow-600 rounded-md">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                <span className="text-xs font-black uppercase">Pending</span>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setReplyModal(msg);
                                setReplyText(msg.reply_message || "");
                              }}
                              className={`flex items-center gap-2 px-4 py-2 font-black text-xs uppercase border-2 border-black transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]
                                ${msg.replied_at ? "bg-white hover:bg-gray-100" : "bg-[var(--mint)] hover:bg-green-300"}`}
                            >
                              {msg.replied_at ? "View Reply" : "Reply Now"} <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* REPLY MODAL */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_white] w-full max-w-lg p-0 animate-scale-in">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h3 className="font-black text-lg uppercase flex items-center gap-2">
                <Mail className="w-5 h-5" /> Reply to Message
              </h3>
              <button onClick={() => setReplyModal(null)} className="text-white hover:text-gray-300 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-100 border-2 border-black">
                <p className="text-xs font-bold text-gray-500 uppercase">From: {replyModal.name} ({replyModal.email})</p>
                <p className="font-bold text-sm mt-1">"{replyModal.subject || "No Subject"}"</p>
              </div>

              <textarea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full border-3 border-black p-4 font-medium mb-6 resize-none focus:outline-none focus:ring-4 ring-[var(--pink-100)]"
                placeholder="Type your reply here..."
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReplyModal(null)}
                  className="px-6 py-3 font-bold uppercase border-3 border-black bg-white hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => sendReply(replyModal.id)}
                  className="px-6 py-3 font-bold uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_black] transition-all flex items-center gap-2"
                >
                  Send Reply <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Improved Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} border-3 border-black shadow-[6px_6px_0px_black] p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] transition-all cursor-default`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white rounded-md shadow-sm">
          {icon}
        </div>
        <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
      </div>
      <p className="text-xs font-black uppercase tracking-wider mb-1 opacity-80">{title}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}