import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, ShieldCheck, 
  Activity, ArrowUpRight, Search, Filter, MoreHorizontal, AlertTriangle,
  Zap, Database, Globe, ChevronRight, BarChart3, Lock, LayoutDashboard,
  UserCircle, ExternalLink, Mail, CheckCircle, XCircle, RefreshCw, Layers
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#0071E3', '#32D74B', '#FF3B30', '#FF9500', '#AF52DE', '#5AC8FA'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading: authLoading, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to sync registry data.");
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  if (authLoading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-500">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  const topCreatorsData = users
    .filter(u => u.stats?.totalEarnings > 0)
    .sort((a, b) => (b.stats?.totalEarnings || 0) - (a.stats?.totalEarnings || 0))
    .slice(0, 5)
    .map((u, i) => ({
      name: u.name || 'User',
      earnings: u.stats?.totalEarnings || 0,
      fill: COLORS[i % COLORS.length]
    }));

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans">
      <NavBar />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Apple Style Admin Sidebar */}
        <aside className="w-64 bg-[#fbfbfb]/80 backdrop-blur-xl border-r border-gray-200 hidden lg:flex flex-col h-full p-4 overflow-y-auto">
          <div className="mb-8 pt-4 px-2">
            <div className="flex items-center gap-2 mb-8 px-2">
              <ShieldCheck size={22} className="text-[#0071e3]" />
              <span className="text-base font-extrabold tracking-tight">Management</span>
            </div>

            <nav className="space-y-1">
              <AdminSidebarItem 
                icon={<Activity size={18} />} 
                label="Infrastructure Overview" 
                active={activeTab === "overview"} 
                onClick={() => setActiveTab("overview")} 
              />
              <AdminSidebarItem 
                icon={<Users size={18} />} 
                label="Creator Registry" 
                active={activeTab === "users"} 
                onClick={() => setActiveTab("users")} 
              />
              <AdminSidebarItem 
                icon={<Package size={18} />} 
                label="Asset Database" 
                active={activeTab === "products"} 
                onClick={() => setActiveTab("products")} 
              />
              <AdminSidebarItem 
                icon={<DollarSign size={18} />} 
                label="Settlement Center" 
                active={activeTab === "payouts"}
                onClick={() => toast.info("Payout logic is protected.")} 
              />
            </nav>
          </div>

          <div className="mt-4 px-2">
            <button 
                onClick={fetchData}
                disabled={refreshing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Syncing..." : "Sync Database"}
            </button>
          </div>
          
          <div className="mt-auto p-2">
            <div className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm">
                <p className="text-[9px] font-extrabold text-[#8e8e93] mb-3 uppercase tracking-[0.15em]">Admin Identity</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0071E3] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-100">
                    AD
                    </div>
                    <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{currentUser?.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] text-green-600 font-extrabold uppercase">ONLINE</p>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Management Core</h1>
                <p className="text-gray-500 text-sm font-medium">Monitoring platform liquidity and creator expansion.</p>
              </div>
              <div className="flex gap-3">
                <StatusBadge icon={<CheckCircle size={14} className="text-green-500" />} label="Database Online" />
                <StatusBadge icon={<Activity size={14} className="text-blue-500" />} label="TX Pipeline Active" />
              </div>
            </header>

            {dataLoading && !stats && !users.length ? (
                 <div className="h-[400px] flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-bold text-gray-400 font-sans">SYNCHRONIZING SECURE REGISTRY...</p>
                  </div>
            ) : (
              <>
                {activeTab === "overview" && stats && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <AdminStatCard title="Global GMV" value={`₹${stats.totalGMV?.toLocaleString()}`} icon={<DollarSign size={20} className="text-[#0071E3]" />} />
                      <AdminStatCard title="Platform Net" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={<BarChart3 size={20} className="text-[#32D74B]" />} />
                      <AdminStatCard title="Registry Nodes" value={stats.totalUsers} icon={<Users size={20} className="text-[#AF52DE]" />} />
                      <AdminStatCard title="Active Assets" value={stats.totalProducts} icon={<Package size={20} className="text-[#FF9500]" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Expansion Chart */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Revenue Projections</h3>
                            <div className="flex gap-4">
                                <LegendItem color="bg-[#0071E3]" label="Gross Flow" />
                                <LegendItem color="bg-gray-200" label="Net Yield" />
                            </div>
                          </div>
                          <div className="h-[340px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueChart}>
                                  <defs>
                                      <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#0071E3" stopOpacity={0.1}/>
                                          <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f7" />
                                  <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fill: '#8e8e93', fontWeight: 600}} 
                                    dy={15}
                                  />
                                  <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fill: '#8e8e93', fontWeight: 600}} 
                                    dx={-10}
                                  />
                                  <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}} 
                                  />
                                  <Area type="monotone" dataKey="revenue" stroke="#0071E3" strokeWidth={4} fillOpacity={1} fill="url(#colorGMV)" animationDuration={2000} />
                                  <Area type="monotone" dataKey="platform_fee" stroke="#e5e7eb" strokeWidth={2} fill="transparent" />
                                </AreaChart>
                              </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Revenue Share Mix */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col items-center">
                          <h3 className="text-xl font-bold self-start mb-2">Revenue Mix</h3>
                          <p className="text-xs font-medium text-gray-400 self-start mb-8 italic">Creator share vs Platform retention.</p>
                          <div className="h-[240px] w-full relative flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { name: 'Creators', value: stats.totalGMV - stats.totalRevenue },
                                        { name: 'Platform', value: stats.totalRevenue }
                                      ]}
                                      cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value"
                                      stroke="none"
                                      cornerRadius={8}
                                      animationDuration={1500}
                                    >
                                      <Cell fill="#0071E3" />
                                      <Cell fill="#f2f2f7" />
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Take Rate</p>
                                <p className="text-2xl font-extrabold text-[#0071E3]">5.0%</p>
                              </div>
                          </div>
                          <div className="mt-8 space-y-3 w-full">
                              <div className="flex justify-between items-center p-4 rounded-2xl bg-[#F5F5F7] border border-gray-50">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">System Yield</span>
                                <span className="text-sm font-extrabold text-green-600">95.0% Efficiency</span>
                              </div>
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Transaction Pipeline */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <History size={20} className="text-[#0071E3]" /> TX Journal
                            </h3>
                            <button className="text-xs font-bold text-[#0071E3] py-2 px-4 bg-blue-50 rounded-xl">View Protocol</button>
                          </div>
                          <div className="space-y-4">
                            {stats.purchases.slice(0, 5).map((p, i) => (
                              <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#fbfbfb] border border-gray-100 hover:border-blue-100 transition-all group">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#0071E3] group-hover:bg-[#0071E3] group-hover:text-white transition-all shadow-sm">
                                    <CreditCard size={18} />
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-sm tracking-tight text-[#1d1d1f]">₹{p.amount}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(p.purchased_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Verified</p>
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1">Fee: ₹{p.platform_fee}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Performers Logic */}
                        <div className="bg-[#1d1d1f] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                             <div className="relative z-10 h-full flex flex-col">
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <BarChart3 size={20} className="text-[#32D74B]" /> Creator Hierarchy
                                </h3>
                                <div className="h-[200px] w-full mb-8">
                                    {topCreatorsData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topCreatorsData}>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip 
                                                    contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', color: '#000'}}
                                                    itemStyle={{color: '#000'}}
                                                />
                                                <Bar dataKey="earnings" radius={[8, 8, 0, 0]} barSize={40}>
                                                    {topCreatorsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 italic text-sm border border-dashed border-white/10 rounded-3xl">
                                            Aggregating node performance...
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-[0.2em]">Aggregate Creator Payouts</p>
                                        <p className="text-4xl font-extrabold tracking-tighter text-white">₹{(stats.totalGMV - stats.totalRevenue).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setActiveTab("users")} className="w-full py-4.5 bg-white text-[#1d1d1f] rounded-2xl font-extrabold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]">
                                        Entity Database <ChevronRight size={18} />
                                    </button>
                                </div>
                             </div>
                             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8">
                         <div>
                            <h3 className="text-2xl font-bold">Creator Node Identity</h3>
                            <p className="text-sm text-gray-400 font-medium font-sans mt-0.5">Participating entities: <span className="text-[#0071E3] font-bold">{users.length}</span></p>
                         </div>
                         <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input type="text" placeholder="Probe identity..." className="w-full md:w-72 pl-12 pr-6 py-3.5 bg-[#F5F5F7] rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#0071E3]/20 transition-all placeholder:text-gray-400" />
                            </div>
                         </div>
                    </div>
                    <div className="overflow-x-auto px-6 pb-6">
                      <table className="w-full text-left">
                        <thead className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                          <tr>
                            <th className="px-6 py-6 pb-4">Identity Node</th>
                            <th className="px-6 py-6 pb-4">Auth Level</th>
                            <th className="px-6 py-6 pb-4 text-center">Gross Accrual</th>
                            <th className="px-6 py-6 pb-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-sans">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#F5F5F7]/50 transition-colors group">
                              <td className="px-6 py-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center font-extrabold text-sm text-[#8e8e93] shadow-sm group-hover:shadow-md transition-shadow">
                                    {(user.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-sm tracking-tight text-[#1d1d1f] truncate">{user.name || 'Root Entity'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold truncate group-hover:text-[#0071E3] transition-colors">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-8">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest ${
                                  user.role === 'admin' ? 'bg-blue-50 text-[#0071E3] border border-blue-100' : 'bg-gray-100/50 text-[#8e8e93] border border-gray-100'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-8 text-center">
                                <div className="min-w-[140px]">
                                    <p className="text-base font-extrabold text-[#1d1d1f]">₹{user.stats?.totalEarnings?.toLocaleString() || 0}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user.stats?.salesCount || 0} Acquisitions</p>
                                </div>
                              </td>
                              <td className="px-6 py-8 text-right">
                                <div className="flex justify-end gap-3">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[#8e8e93] hover:text-[#0071E3] hover:border-blue-100 transition-all shadow-sm">
                                        <TrendingUp size={16} />
                                    </button>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[#8e8e93] hover:text-[#1d1d1f] hover:bg-gray-50 transition-all shadow-sm">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "products" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col group overflow-hidden relative">
                        <div className="aspect-[4/3] bg-[#F5F5F7] rounded-3xl mb-8 overflow-hidden relative border border-gray-50 shadow-inner">
                           {product.thumbnail_url ? (
                             <img src={product.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <Layers size={56} className="opacity-40" />
                             </div>
                           )}
                           <div className="absolute top-5 left-5">
                              <div className="bg-white/95 backdrop-blur-md border border-gray-100 px-3 py-1.5 rounded-xl font-extrabold text-[9px] uppercase tracking-widest text-[#8e8e93] shadow-sm flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                NODE: {product.id.slice(0,8)}
                              </div>
                           </div>
                        </div>
                        <h4 className="font-extrabold text-xl mb-3 truncate pr-4">{product.name}</h4>
                        <div className="flex items-center gap-3 mb-8">
                             <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[8px] text-[#0071E3]">{(product.profiles?.name || 'R')[0]}</div>
                             <span className="text-xs font-bold text-gray-400 truncate">{product.profiles?.name || 'System Entity'}</span>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <p className="font-extrabold text-2xl tracking-tighter text-[#1d1d1f]">₹{product.price}</p>
                          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] border ${
                            product.is_active 
                                ? 'bg-green-50 text-green-600 border-green-100' 
                                : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {product.is_active ? 'Live' : 'Deactivated'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminSidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group ${
        active 
          ? "bg-[#0071e3] text-white shadow-xl shadow-blue-200" 
          : "text-gray-500 hover:bg-[#F5F5F7] hover:text-[#1d1d1f] active:scale-[0.98]"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-sans tracking-tight">{label}</span>
      {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
    </button>
  );
}

function AdminStatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48 relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#1d1d1f] flex items-center justify-center group-hover:bg-[#0071E3] group-hover:text-white transition-all shadow-inner">
          {icon}
        </div>
        <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover:bg-white/40 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/10 group-hover:bg-white/20" />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-3xl font-extrabold tracking-tighter text-[#1d1d1f]">{value}</p>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F5F5F7] rounded-full opacity-40 group-hover:scale-[3] group-hover:bg-[#0071E3]/5 transition-transform duration-700"></div>
    </div>
  );
}

function StatusBadge({ icon, label }) {
    return (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            {icon}
            <span className="text-[10px] font-extrabold text-[#1d1d1f] uppercase tracking-widest">{label}</span>
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color} shadow-sm border border-black/5`}></div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
