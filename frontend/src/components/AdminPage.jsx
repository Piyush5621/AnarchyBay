import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== "admin")) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isAuthenticated, role, loading, navigate]);

  useEffect(() => {
    if (role === "admin") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeTab]);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setDataLoading(true);
    const token = getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (["overview", "users", "products"].includes(activeTab)) {
        const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
        const data = await res.json();
        if (res.ok) setStats(data);
      }

      if (activeTab === "users") {
        const res = await fetch(`${API_URL}/api/admin/users`, { headers });
        const data = await res.json();
        if (res.ok) setUsers(data.users || []);
      }

      if (activeTab === "products") {
        const res = await fetch(`${API_URL}/api/admin/products`, { headers });
        const data = await res.json();
        if (res.ok) setProducts(data.products || []);
      }

      if (activeTab === "contacts") {
        const res = await fetch(`${API_URL}/api/admin/contact-messages`, {
          headers,
        });
        const data = await res.json();
        if (res.ok) setContacts(data.messages || []);
      }
    } catch {
      toast.error("Failed to fetch admin data");
    } finally {
      setDataLoading(false);
    }
  };

  /* ================= USER ROLE ================= */
  const updateUserRole = async (userId, role) => {
    const token = getAccessToken();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }
      );

      if (res.ok) {
        toast.success("Role updated");
        fetchData();
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  /* ================= PRODUCTS ================= */
  const toggleFeatured = async (id, is_featured) => {
    const token = getAccessToken();
    await fetch(`${API_URL}/api/admin/products/${id}/featured`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_featured: !is_featured }),
    });
    fetchData();
  };

  const deactivateProduct = async (id) => {
    if (!confirm("Deactivate this product?")) return;
    const token = getAccessToken();
    await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  /* ================= CONTACT REPLY ================= */
  const handleReply = async (msg) => {
    const replyMessage = prompt(`Reply to ${msg.email}:`);
    if (!replyMessage) return;

    const token = getAccessToken();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/contact-messages/${msg.id}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ replyMessage }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Reply sent");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Reply failed");
    }
  };

  if (loading || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4">
        {/* TABS */}
        <div className="flex gap-4 mb-8">
          {["overview", "users", "products", "contacts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold uppercase border-3 border-black ${
                activeTab === tab
                  ? "bg-[var(--pink-500)] text-white"
                  : "bg-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="p-12 text-center font-bold">Loading data…</div>
        ) : (
          <>
            {/* ================= OVERVIEW ================= */}
            {activeTab === "overview" && stats && (
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard title="Users" value={stats.stats.totalUsers} icon="👥" />
                <StatCard title="Products" value={stats.stats.totalProducts} icon="📦" />
                <StatCard title="Orders" value={stats.stats.totalPurchases} icon="🛒" />
                <StatCard
                  title="Revenue"
                  value={`₹${stats.stats.totalRevenue}`}
                  icon="💰"
                />
              </div>
            )}

            {/* ================= USERS ================= */}
            {activeTab === "users" && (
              <TableWrapper>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "Anonymous"}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user.id, e.target.value)
                          }
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        {/* ✅ FIXED */}
                        <Link to={`/seller/${user.id}`} className="underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            )}

            {/* ================= PRODUCTS ================= */}
            {activeTab === "products" && (
              <TableWrapper>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Creator</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.profiles?.name}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <button onClick={() => toggleFeatured(p.id, p.is_featured)}>
                          {p.is_featured ? "★" : "☆"}
                        </button>
                      </td>
                      <td>
                        {p.is_active ? (
                          <button onClick={() => deactivateProduct(p.id)}>
                            Deactivate
                          </button>
                        ) : (
                          "Inactive"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            )}

            {/* ================= CONTACTS ================= */}
            {activeTab === "contacts" && (
              <TableWrapper>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((msg) => (
                    <tr key={msg.id}>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td>{msg.subject || "-"}</td>
                      <td>{msg.message}</td>
                      <td>{msg.replied_at ? "Replied" : "Pending"}</td>
                      <td>
                        <button
                          disabled={!!msg.replied_at}
                          onClick={() => handleReply(msg)}
                        >
                          Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */
function StatCard({ title, value, icon }) {
  return (
    <div className="border-3 border-black p-6">
      <div className="text-4xl">{icon}</div>
      <div className="font-black text-2xl">{value}</div>
      <div className="uppercase text-sm">{title}</div>
    </div>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto border-3 border-black">
      <table className="w-full">{children}</table>
    </div>
  );
}
