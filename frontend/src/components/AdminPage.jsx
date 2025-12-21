import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { 
  Users, Package, DollarSign, TrendingUp, ShieldCheck, 
  Search, RefreshCw, UserCheck, UserX, Shield, Flag, 
  Eye, Ban, Unlock, FileWarning, Link as LinkIcon, LayoutDashboard,
  CheckCircle, XCircle, Sparkles
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading: authLoading, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportFilter, setReportFilter] = useState("pending");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== 'admin')) {
      toast.error("Unauthorized access denied.");
      navigate("/");
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeTab]);

  const fetchData = async () => {
    setRefreshing(true);
    const token = getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (activeTab === "overview") {
        const res = await fetch(`${API_URL}/api/analytics/admin`, { headers });
        const data = await res.json();
        if (res.ok) setStats(data.data);
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

      if (activeTab === "reports") {
        // Fetch ALL reports to maintain state
        const reportsRes = await fetch(`${API_URL}/api/admin/reports?status=all`, { headers });
        const reportsData = await reportsRes.json();
        if (reportsRes.ok) setAllReports(reportsData.reports || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load data.");
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchData();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRestrictUser = async (userId, restrict, reason = '') => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/restrict`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_restricted: restrict, restriction_reason: reason }),
      });
      if (res.ok) {
        toast.success(`User ${restrict ? 'restricted' : 'unrestricted'}`);
        setShowUserModal(false);
        fetchData();
      } else {
        toast.error('Failed to update restriction');
      }
    } catch {
      toast.error('Failed to update restriction');
    }
  };

  const handleToggleProductActive = async (productId, currentStatus) => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${productId}/toggle-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchData();
      } else {
        toast.error('Failed to update product');
      }
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleReportAction = async (reportId, status, action = null, notes = '') => {
    const token = getAccessToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, action, admin_notes: notes }),
      });
      if (res.ok) {
        toast.success(`Report ${status}`);
        setShowReportModal(false);
        // Re-fetch all reports to update state
        const token = getAccessToken();
        const reportsRes = await fetch(`${API_URL}/api/admin/reports?status=all`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const reportsData = await reportsRes.json();
        if (reportsRes.ok) setAllReports(reportsData.reports || []);
      } else {
        toast.error('Failed to update report');
      }
    } catch {
      toast.error('Failed to update report');
    }
  };

  if (authLoading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-gray-900">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const topCreatorsData = users
    .filter(u => u.stats?.totalEarnings > 0)
    .sort((a, b) => (b.stats?.totalEarnings || 0) - (a.stats?.totalEarnings || 0))
    .slice(0, 5)
    .map((u) => ({
      name: u.name || 'User',
      earnings: u.stats?.totalEarnings || 0,
    }));

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter reports based on active filter
  const filteredReports = reportFilter === 'all' 
    ? allReports 
    : allReports.filter(r => r.status === reportFilter);

  const pendingCount = allReports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Minimal Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-black" />
              <div>
                <h2 className="text-lg font-bold text-black">Admin Panel</h2>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarButton 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
            />
            <SidebarButton 
              icon={<Users size={20} />} 
              label="Users" 
              active={activeTab === "users"} 
              onClick={() => setActiveTab("users")}
              badge={users.length}
            />
            <SidebarButton 
              icon={<Package size={20} />} 
              label="Products" 
              active={activeTab === "products"} 
              onClick={() => setActiveTab("products")}
              badge={products.length}
            />
            <SidebarButton 
              icon={<Flag size={20} />} 
              label="Reports" 
              active={activeTab === "reports"} 
              onClick={() => setActiveTab("reports")}
              badge={pendingCount}
              badgeColor="bg-red-500"
            />
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="p-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-black flex items-center justify-center font-bold text-sm">
                  {(currentUser?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{currentUser?.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <p className="text-xs text-gray-600">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-5xl font-black text-black mb-2 tracking-tight">
                    {activeTab === "overview" && "DASHBOARD"}
                    {activeTab === "users" && "USER MANAGEMENT"}
                    {activeTab === "products" && "PRODUCTS"}
                    {activeTab === "reports" && "REPORTS"}
                  </h1>
                  <p className="text-gray-600 font-bold">Manage your platform efficiently</p>
                </div>
                {(activeTab === "users" || activeTab === "products") && (
                  <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 pl-12 pr-4 py-4 bg-white border-4 border-black rounded-none font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>
                )}
              </div>
            </header>

            {dataLoading && !stats && !users.length ? (
              <div className="h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-black">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === "overview" && stats && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard 
                        title="Total Revenue" 
                        value={`₹${stats.totalGMV?.toLocaleString()}`} 
                        icon={<DollarSign size={28} />}
                        color="bg-blue-300"
                      />
                      <StatCard 
                        title="Platform Fee" 
                        value={`₹${stats.totalRevenue?.toLocaleString()}`} 
                        icon={<TrendingUp size={28} />}
                        color="bg-green-300"
                      />
                      <StatCard 
                        title="Total Users" 
                        value={stats.totalUsers} 
                        icon={<Users size={28} />}
                        color="bg-purple-300"
                      />
                      <StatCard 
                        title="Products" 
                        value={stats.totalProducts} 
                        icon={<Package size={28} />}
                        color="bg-yellow-300"
                      />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-none p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-black mb-6 text-black">REVENUE TRENDS</h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueChart}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                              <XAxis dataKey="date" stroke="#000" style={{fontSize: 12, fontWeight: 'bold'}} />
                              <YAxis stroke="#000" style={{fontSize: 12, fontWeight: 'bold'}} />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '4px solid black',
                                  borderRadius: '0',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#000" 
                                strokeWidth={3}
                                fill="#fde047" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-black rounded-none p-8 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                          <Sparkles size={20} className="text-yellow-300" />
                          TOP CREATORS
                        </h3>
                        <div className="h-52">
                          {topCreatorsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={topCreatorsData}>
                                <Bar dataKey="earnings" fill="#fde047" />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'black',
                                    border: '2px solid #fde047',
                                    borderRadius: '0',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-white/50">
                              <p className="text-sm font-bold">No data available</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 pt-6 border-t-2 border-white/20">
                          <p className="text-sm text-white/60 mb-2 font-bold">TOTAL EARNINGS</p>
                          <p className="text-3xl font-black">₹{(stats.totalGMV - stats.totalRevenue).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="bg-white rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-yellow-300 border-b-4 border-black">
                          <tr>
                            <th className="px-6 py-5 text-left text-xs font-black text-black uppercase tracking-wider">User</th>
                            <th className="px-6 py-5 text-left text-xs font-black text-black uppercase tracking-wider">Role</th>
                            <th className="px-6 py-5 text-left text-xs font-black text-black uppercase tracking-wider">Status</th>
                            <th className="px-6 py-5 text-left text-xs font-black text-black uppercase tracking-wider">Earnings</th>
                            <th className="px-6 py-5 text-right text-xs font-black text-black uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-black">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-5">
                                <button
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                  className="flex items-center gap-3 hover:opacity-75 transition-opacity text-left w-full"
                                >
                                  <div className="w-12 h-12 rounded-none bg-blue-300 flex items-center justify-center text-black font-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {(user.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-black text-black hover:underline">{user.name || 'Unknown'}</p>
                                    <p className="text-sm font-bold text-gray-600">{user.email}</p>
                                  </div>
                                </button>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-none text-xs font-black border-2 border-black ${
                                  user.role === 'admin' ? 'bg-red-300' :
                                  user.role === 'creator' ? 'bg-purple-300' :
                                  user.role === 'seller' ? 'bg-blue-300' :
                                  'bg-gray-300'
                                }`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center gap-2 text-xs font-black ${
                                    user.is_active === false ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${user.is_active === false ? 'bg-red-500' : 'bg-green-500'}`} />
                                    {user.is_active === false ? 'INACTIVE' : 'ACTIVE'}
                                  </span>
                                  {user.is_restricted && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600">
                                      <Ban size={14} />
                                      RESTRICTED
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div>
                                  <p className="font-black text-black">₹{user.stats?.totalEarnings?.toLocaleString() || 0}</p>
                                  <p className="text-xs font-bold text-gray-600">{user.stats?.salesCount || 0} sales</p>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-none font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                  <Shield size={16} />
                                  MANAGE
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-none overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group">
                        <div className="aspect-video bg-gray-100 relative overflow-hidden border-b-4 border-black">
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={48} className="text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span className={`px-4 py-2 rounded-none text-xs font-black border-2 border-black ${
                              product.is_active ? 'bg-green-300' : 'bg-red-300'
                            }`}>
                              {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-black text-lg mb-3 line-clamp-1">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-none bg-gray-200 flex items-center justify-center text-xs font-black text-black border-2 border-black">
                              {(product.profiles?.name || 'C')[0]}
                            </div>
                            <span className="text-sm font-bold text-gray-600">{product.profiles?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-black text-black">₹{product.price}</p>
                            <button
                              onClick={() => handleToggleProductActive(product.id, product.is_active)}
                              className={`px-5 py-2.5 rounded-none font-black border-2 border-black transition-all ${
                                product.is_active 
                                  ? 'bg-red-300 hover:bg-red-400' 
                                  : 'bg-green-300 hover:bg-green-400'
                              }`}
                            >
                              {product.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reports" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      {['pending', 'reviewing', 'approved', 'rejected', 'all'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setReportFilter(filter)}
                          className={`px-6 py-3 rounded-none font-black border-4 border-black transition-all ${
                            reportFilter === filter
                              ? 'bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          {filter.toUpperCase()}
                          <span className="ml-2 text-gray-600">
                            ({filter === 'all' ? allReports.length : allReports.filter(r => r.status === filter).length})
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {filteredReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-none p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                          <div className="flex items-start gap-6">
                            <div className="w-28 h-28 rounded-none bg-gray-100 overflow-hidden flex-shrink-0 border-4 border-black">
                              {report.products?.thumbnail_url ? (
                                <img src={report.products.thumbnail_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={36} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-black text-xl mb-2">{report.products?.name || 'Unknown Product'}</h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                                    <span>By: {report.profiles?.name}</span>
                                    <span>•</span>
                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <span className={`px-4 py-2 rounded-none text-xs font-black border-2 border-black ${
                                  report.status === 'pending' ? 'bg-yellow-300' :
                                  report.status === 'reviewing' ? 'bg-blue-300' :
                                  report.status === 'approved' ? 'bg-green-300' :
                                  report.status === 'rejected' ? 'bg-red-300' :
                                  'bg-gray-300'
                                }`}>
                                  {report.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-none border-2 border-black">
                                <div>
                                  <span className="text-xs font-black text-black uppercase">Reason</span>
                                  <p className="font-bold text-black mt-1">{report.reason}</p>
                                </div>
                                {report.description && (
                                  <div>
                                    <span className="text-xs font-black text-black uppercase">Details</span>
                                    <p className="text-sm text-gray-600 font-medium mt-1">{report.description}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => { setSelectedReport(report); setShowReportModal(true); }}
                                  className="px-5 py-2.5 bg-black text-white rounded-none font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                  <Eye size={16} className="inline mr-2" />
                                  REVIEW
                                </button>
                                <button
                                  onClick={() => navigate(`/product/${report.products?.id}`)}
                                  className="px-5 py-2.5 bg-white rounded-none font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                  <LinkIcon size={16} className="inline mr-2" />
                                  VIEW PRODUCT
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredReports.length === 0 && (
                        <div className="text-center py-20">
                          <FileWarning size={56} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 font-bold">No reports found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-2xl w-full p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">MANAGE USER</h2>
              <button onClick={() => setShowUserModal(false)} className="w-10 h-10 flex items-center justify-center rounded-none bg-gray-100 hover:bg-gray-200 border-2 border-black transition-all">
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-6 p-6 bg-blue-100 rounded-none border-4 border-black">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-none bg-black text-white flex items-center justify-center font-black text-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {(selectedUser.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-lg">{selectedUser.name}</p>
                  <p className="text-sm font-bold text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-black text-black uppercase">Role</span>
                  <p className="font-black text-black mt-1">{selectedUser.role.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-xs font-black text-black uppercase">Status</span>
                  <p className={`font-black mt-1 ${selectedUser.is_active === false ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.is_active === false ? 'INACTIVE' : 'ACTIVE'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-black text-black uppercase">Change Role</h3>
              <div className="grid grid-cols-2 gap-3">
                {['customer', 'seller', 'creator', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={async () => {
                      const token = getAccessToken();
                      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/role`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ role }),
                      });
                      if (res.ok) {
                        toast.success(`Role updated to ${role}`);
                        setShowUserModal(false);
                        fetchData();
                      }
                    }}
                    disabled={selectedUser.role === role}
                    className={`px-6 py-3 rounded-none font-black border-4 border-black transition-all ${
                      selectedUser.role === role
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-300 hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                  >
                    {role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-black text-black uppercase">Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleToggleUserActive(selectedUser.id, selectedUser.is_active)}
                  className={`px-6 py-3 rounded-none font-black border-4 border-black transition-all ${
                    selectedUser.is_active === false
                      ? 'bg-green-300 hover:bg-green-400'
                      : 'bg-red-300 hover:bg-red-400'
                  }`}
                >
                  {selectedUser.is_active === false ? <UserCheck size={16} className="inline mr-2" /> : <UserX size={16} className="inline mr-2" />}
                  {selectedUser.is_active === false ? 'ACTIVATE' : 'DEACTIVATE'}
                </button>
                <button
                  onClick={() => {
                    if (selectedUser.is_restricted) {
                      handleRestrictUser(selectedUser.id, false);
                    } else {
                      const reason = prompt('Enter restriction reason:');
                      if (reason) handleRestrictUser(selectedUser.id, true, reason);
                    }
                  }}
                  className={`px-6 py-3 rounded-none font-black border-4 border-black transition-all ${
                    selectedUser.is_restricted
                      ? 'bg-blue-300 hover:bg-blue-400'
                      : 'bg-orange-300 hover:bg-orange-400'
                  }`}
                >
                  {selectedUser.is_restricted ? <Unlock size={16} className="inline mr-2" /> : <Ban size={16} className="inline mr-2" />}
                  {selectedUser.is_restricted ? 'UNRESTRICT' : 'RESTRICT'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowUserModal(false)}
              className="w-full py-3 rounded-none bg-gray-100 hover:bg-gray-200 font-black border-4 border-black transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-2xl w-full p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">REVIEW REPORT</h2>
              <button onClick={() => setShowReportModal(false)} className="w-10 h-10 flex items-center justify-center rounded-none bg-gray-100 hover:bg-gray-200 border-2 border-black transition-all">
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <div className="w-28 h-28 rounded-none bg-gray-100 overflow-hidden border-4 border-black">
                  {selectedReport.products?.thumbnail_url ? (
                    <img src={selectedReport.products.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={36} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-xl mb-1">{selectedReport.products?.name}</h3>
                  <p className="text-sm font-bold text-gray-600 mb-2">₹{selectedReport.products?.price}</p>
                  <button
                    onClick={() => navigate(`/product/${selectedReport.products?.id}`)}
                    className="text-sm font-black text-blue-600 hover:text-blue-700"
                  >
                    VIEW PRODUCT →
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-none border-2 border-black">
                <div>
                  <span className="text-xs font-black text-black uppercase">Reported By</span>
                  <p className="font-bold">{selectedReport.profiles?.name} ({selectedReport.profiles?.email})</p>
                </div>
                <div>
                  <span className="text-xs font-black text-black uppercase">Reason</span>
                  <p className="font-bold">{selectedReport.reason}</p>
                </div>
                {selectedReport.description && (
                  <div>
                    <span className="text-xs font-black text-black uppercase">Description</span>
                    <p className="text-sm text-gray-600 font-medium">{selectedReport.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-black text-black uppercase">Date</span>
                  <p className="text-sm font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-black uppercase">Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'approved', 'deactivate_product', 'Report approved. Product deactivated.')}
                  className="px-6 py-3 bg-red-300 hover:bg-red-400 rounded-none font-black border-4 border-black transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  APPROVE & DEACTIVATE
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'approved', null, 'Report approved.')}
                  className="px-6 py-3 bg-green-300 hover:bg-green-400 rounded-none font-black border-4 border-black transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  APPROVE
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'rejected', null, 'Report rejected.')}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 rounded-none font-black border-4 border-black transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  REJECT
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'reviewing', null, 'Under review.')}
                  className="px-6 py-3 bg-blue-300 hover:bg-blue-400 rounded-none font-black border-4 border-black transition-all"
                >
                  REVIEWING
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowReportModal(false)}
              className="w-full mt-6 py-3 rounded-none bg-gray-100 hover:bg-gray-200 font-black border-4 border-black transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function SidebarButton({ icon, label, active, onClick, badge, badgeColor = "bg-blue-500" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
        active
          ? "bg-gray-100 text-black"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-none p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}>
      <div className="w-16 h-16 rounded-none bg-black flex items-center justify-center text-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
        {icon}
      </div>
      <p className="text-sm font-black text-black uppercase mb-2">{title}</p>
      <p className="text-3xl font-black text-black">{value}</p>
    </div>
  );
}
