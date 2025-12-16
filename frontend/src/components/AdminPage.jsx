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

              {activeTab === "products" && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--pink-100)] border-b-3 border-black">
                        <tr>
                          <th className="px-6 py-4 text-left font-black uppercase">Product</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Creator</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Price</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Featured</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b-2 border-gray-200 hover:bg-white">
                            <td className="px-6 py-4">
                              <p className="font-bold">{product.name}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">{product.description}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{product.profiles?.name || 'Unknown'}</td>
                            <td className="px-6 py-4 font-black text-[var(--pink-600)]">
                              {product.currency === 'INR' ? '₹' : '$'}{product.price}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleFeatured(product.id, product.is_featured)}
                                className={`px-4 py-2 font-bold text-sm border-2 border-black transition-all ${product.is_featured
                                  ? "bg-[var(--yellow-400)]"
                                  : "bg-white hover:bg-[var(--yellow-100)]"
                                  }`}
                              >
                                {product.is_featured ? "★ Featured" : "☆ Feature"}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black ${product.is_active ? "bg-green-200" : "bg-red-200"
                                }`}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 space-x-2">
                              <button
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="px-4 py-2 font-bold text-sm bg-[var(--mint)] border-2 border-black hover:shadow-[2px_2px_0px_var(--black)] transition-all"
                              >
                                View
                              </button>
                              {product.is_active && (
                                <button
                                  onClick={() => deactivateProduct(product.id)}
                                  className="px-4 py-2 font-bold text-sm bg-red-200 border-2 border-black hover:shadow-[2px_2px_0px_var(--black)] transition-all"
                                >
                                  Deactivate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === "contacts" && (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--pink-100)] border-b-3 border-black">
                        <tr>
                          <th className="px-6 py-4 text-left font-black uppercase">Name</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Email</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Subject</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Message</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Date</th>
                          <th className="px-6 py-4 text-left font-black uppercase">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {contacts.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-10 text-center font-bold">
                              No contact messages yet
                            </td>
                          </tr>
                        )}

                        {contacts.map((msg) => (
                          <tr key={msg.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                            {/* Name */}
                            <td className="px-6 py-4 font-bold">{msg.name}</td>

                            {/* Email */}
                            <td className="px-6 py-4 text-gray-700">{msg.email}</td>

                            {/* Subject */}
                            <td className="px-6 py-4">{msg.subject || "-"}</td>

                            {/* Message */}
                            <td className="px-6 py-4 max-w-md">
                              <p className="truncate" title={msg.message}>
                                {msg.message}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              {msg.replied_at ? (
                                <span className="px-3 py-1 text-xs font-bold uppercase bg-green-200 border-2 border-black">
                                  Replied
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-bold uppercase bg-yellow-200 border-2 border-black">
                                  Pending
                                </span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(msg.created_at).toLocaleString()}
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4">
                              <button
                                disabled={!!msg.replied_at}
                                onClick={() => {
                                  setReplyModal(msg);
                                  setReplyText("");
                                }}
                                className={`px-4 py-2 font-bold text-sm border-2 border-black transition-all
    ${msg.replied_at
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-[var(--mint)] hover:shadow-[2px_2px_0px_var(--black)]"}
  `}
                              >
                                {msg.replied_at ? "Replied" : "Reply"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {/* ================= REPLY MODAL ================= */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] w-full max-w-md p-6">
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
                onClick={async () => {
                  if (!replyText.trim()) {
                    toast.error("Reply cannot be empty");
                    return;
                  }

                  const token = getAccessToken();

                  try {
                    const res = await fetch(
                      `${API_URL}/api/admin/contact-messages/${replyModal.id}/reply`,
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

                    toast.success("Reply sent successfully ✉️");
                    setReplyModal(null);
                    fetchData();
                  } catch (err) {
                    toast.error(err.message || "Failed to send reply");
                  }
                }}
                className="px-4 py-2 font-bold bg-[var(--pink-500)] text-white border-2 border-black"
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