import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";

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
  // ... existing states
  const [contactFilter, setContactFilter] = useState("all"); // 'all', 'pending', 'replied'




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
    if (!confirm("Are you sure you want to deactivate this product?")) return;
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
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="inline-block px-4 py-2 bg-[var(--pink-500)] text-white border-3 border-black font-bold text-sm uppercase mb-4">
              Admin Panel
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Platform <span className="text-[var(--pink-500)]">Dashboard</span>
            </h1>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {["overview", "users", "products", "contacts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold uppercase border-3 border-black transition-all whitespace-nowrap ${activeTab === tab
                  ? "bg-[var(--pink-500)] text-white shadow-[4px_4px_0px_var(--black)]"
                  : "bg-white hover:bg-[var(--pink-50)]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {dataLoading ? (
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[var(--pink-500)] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-bold">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && stats && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.stats.totalUsers} icon="👥" />
                    <StatCard title="Total Products" value={stats.stats.totalProducts} icon="📦" />
                    <StatCard title="Total Purchases" value={stats.stats.totalPurchases} icon="🛒" />
                    <StatCard title="Total Revenue" value={`₹${stats.stats.totalRevenue.toLocaleString()}`} icon="💰" />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-6">
                      <h3 className="font-black text-xl mb-4">Recent Users</h3>
                      <div className="space-y-3">
                        {stats.recentUsers?.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-white border-2 border-black">
                            <div>
                              <p className="font-bold">{user.name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-[var(--mint)] border-2 border-black">
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-6">
                      <h3 className="font-black text-xl mb-4">Recent Products</h3>
                      <div className="space-y-3">
                        {stats.topProducts?.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-white border-2 border-black">
                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="text-sm text-gray-600">by {product.profiles?.name || 'Unknown'}</p>
                            </div>
                            <span className="font-black text-[var(--pink-600)]">
                              ₹{product.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--pink-100)] border-b-3 border-black">
                        <tr>
                          <th className="px-6 py-4 text-left font-black uppercase">User</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Email</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Role</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Joined</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b-2 border-gray-200 hover:bg-white">
                            <td className="px-6 py-4 font-bold">{user.name || 'Anonymous'}</td>
                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                            <td className="px-6 py-4">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="px-3 py-2 font-bold border-2 border-black bg-white cursor-pointer"
                              >
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                                <option value="creator">Creator</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/seller/${user.id}`);
                                }}
                                className="px-4 py-2 text-sm font-bold uppercase bg-[var(--mint)] border-2 border-black
             hover:shadow-[2px_2px_0px_var(--black)] transition-all"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "contacts" && (
                <div className="space-y-6">
                  {/* Header & Filter Controls */}
                  <div className="bg-[var(--pink-100)] border-3 border-black p-4 shadow-[4px_4px_0px_var(--black)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-black text-xl uppercase flex items-center gap-2">
                      Inbox
                      <span className="bg-black text-white text-sm px-2 py-0.5 rounded-full">
                        {filteredContacts.length}
                      </span>
                    </h3>

                    {/* Filter Buttons */}
                    <div className="flex bg-white border-2 border-black p-1 gap-1">
                      <button
                        onClick={() => setContactFilter("all")}
                        className={`px-4 py-1.5 text-sm font-black uppercase transition-all ${contactFilter === "all"
                            ? "bg-black text-white"
                            : "bg-transparent text-gray-500 hover:bg-gray-100"
                          }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setContactFilter("pending")}
                        className={`px-4 py-1.5 text-sm font-black uppercase transition-all ${contactFilter === "pending"
                            ? "bg-[var(--yellow-400)] text-black border-2 border-black translate-y-[-2px] shadow-[2px_2px_0px_var(--black)]"
                            : "bg-transparent text-gray-500 hover:bg-[var(--yellow-100)]"
                          }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setContactFilter("replied")}
                        className={`px-4 py-1.5 text-sm font-black uppercase transition-all ${contactFilter === "replied"
                            ? "bg-green-400 text-black border-2 border-black translate-y-[-2px] shadow-[2px_2px_0px_var(--black)]"
                            : "bg-transparent text-gray-500 hover:bg-green-100"
                          }`}
                      >
                        Replied
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {filteredContacts.length === 0 && (
                    <div className="bg-white border-3 border-black p-10 text-center shadow-[4px_4px_0px_var(--black)]">
                      <p className="font-bold text-lg text-gray-500">
                        No {contactFilter === 'all' ? '' : contactFilter} messages found.
                      </p>
                    </div>
                  )}

                  {/* Message Cards Grid (Mapping over filteredContacts) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContacts.map((msg) => {
                      const isExpanded = expandedMessageId === msg.id;
                      const isLongMessage = msg.message.length > 120;

                      return (
                        <div
                          key={msg.id}
                          className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--black)] transition-all flex flex-col"
                        >
                          {/* Card Header */}
                          <div className="p-4 border-b-3 border-black bg-gray-50 flex justify-between items-start">
                            <div className="overflow-hidden">
                              <h4 className="font-black text-lg truncate">{msg.name}</h4>
                              <p className="text-sm text-gray-600 font-bold truncate">{msg.email}</p>
                            </div>
                            <span className="text-xs font-bold border-2 border-black px-2 py-1 bg-white whitespace-nowrap ml-2">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1">
                            <div className="mb-3">
                              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Subject:</span>
                              <p className="font-bold text-lg leading-tight break-words">{msg.subject || "(No Subject)"}</p>
                            </div>

                            <div className="bg-[var(--yellow-100)] border-2 border-black p-3 relative">
                              <span className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-1">Message:</span>
                              <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed break-words">
                                {isExpanded || !isLongMessage ? msg.message : `${msg.message.substring(0, 120)}...`}
                              </p>

                              {isLongMessage && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMessage(msg.id);
                                  }}
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
                              <div className="flex items-center gap-2 text-green-700">
                                <div className="w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                                <span className="text-xs font-black uppercase">Replied</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-yellow-700">
                                <div className="w-3 h-3 bg-yellow-400 border-2 border-black rounded-full animate-pulse"></div>
                                <span className="text-xs font-black uppercase">Pending</span>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setReplyModal(msg);
                                setReplyText(msg.reply_message || "");
                              }}
                              className={`px-6 py-2 font-black text-sm uppercase border-2 border-black transition-all shadow-[2px_2px_0px_var(--black)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]
                  ${msg.replied_at ? "bg-green-200" : "bg-[var(--mint)]"}`}
                            >
                              {msg.replied_at ? "View Reply" : "Reply"}
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
      {/* ================= REPLY MODAL ================= */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white pointer-events-auto border-3 border-black shadow-[6px_6px_0px_var(--black)] w-full max-w-md p-6"
          >
            <h3 className="font-black text-xl mb-2">
              Reply to {replyModal.email}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Subject: {replyModal.subject || "No subject"}
            </p>

            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold mb-4 resize-none"
              placeholder="Type your reply here..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplyModal(null)}
                className="px-4 py-2 font-bold border-2 border-black bg-white"
              >
                Cancel
              </button>

              <button
                onClick={() => sendReply(replyModal.id)}
                className="px-4 py-2 font-bold bg-[var(--pink-500)] text-white border-2 border-black hover:shadow-[2px_2px_0px_var(--black)]"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="font-black text-3xl text-[var(--pink-600)]">{value}</span>
      </div>
      <h3 className="font-bold text-gray-600 uppercase text-sm">{title}</h3>
    </div>
  );
}