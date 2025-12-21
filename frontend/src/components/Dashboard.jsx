import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { supabase } from "@/lib/supabase";
import { saveSessionTokens, getAccessToken } from "@/lib/api/client.js";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Cell, Legend
} from 'recharts';
import { 
  ShoppingBag, DollarSign, Package, Users, ArrowUpRight, 
  BarChart2, Activity, Plus, Library, Settings, LogOut,
  Wallet, TrendingUp, History, Zap, CreditCard, ChevronRight,
  LayoutDashboard, UserCircle, Download, ExternalLink, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CHART_COLORS = ['#0071E3', '#32D74B', '#FF3B30', '#FF9500', '#AF52DE', '#5AC8FA'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState("creator");

  useEffect(() => {
    const checkOAuthSession = async () => {
      const token = getAccessToken();
      if (token) {
        setCheckingAuth(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        saveSessionTokens(session);
        fetchAnalytics(); // Fetch after setting session
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
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const token = getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      const [userRes, dashboardRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/user`, { headers }).then(res => res.json()),
        fetch(`${API_URL}/api/analytics/dashboard`, { headers }).then(res => res.json()).catch(() => ({ data: null }))
      ]);

      setAnalytics({
        user: userRes.data,
        creator: dashboardRes.data
      });
      if (refreshing) toast.success("Dashboard synced with latest data");
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to sync workspace data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (checkingAuth || (loading && !analytics)) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-500 font-sans tracking-tight">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  const salesTrendData = analytics?.creator?.salesChart?.map(item => ({
    date: item.date,
    revenue: parseFloat(item.revenue)
  })) || [];

  const topProductsData = analytics?.creator?.topProducts?.map((prod, idx) => ({
    name: prod.name.length > 20 ? prod.name.substring(0, 17) + '...' : prod.name,
    revenue: prod.revenue,
    fill: CHART_COLORS[idx % CHART_COLORS.length]
  })) || [];

  const radialData = [
    {
      name: 'Available',
      value: analytics?.creator?.overview?.availableBalance || 0,
      fill: '#0071E3'
    },
    {
      name: 'Pending',
      value: analytics?.creator?.overview?.pendingPayouts || 0,
      fill: '#AF52DE'
    }
  ];

  const buyerCategoryData = analytics?.user?.categoryStats?.map((stat, idx) => ({
    ...stat,
    fill: CHART_COLORS[idx % CHART_COLORS.length]
  })) || [];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans">
      <NavBar />
      
      <div className="flex h-screen pt-16 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#fbfbfb]/80 backdrop-blur-xl border-r border-gray-200 hidden lg:flex flex-col h-full p-4 overflow-y-auto">
          <div className="mb-8 pt-4 px-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-6 font-sans">Menu</h2>
            <nav className="space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard size={18} />} 
                label="Overview" 
                active={true}
              />
              <SidebarItem 
                icon={<Library size={18} />} 
                label="My Library" 
                onClick={() => navigate("/library")} 
              />
              {user?.role === 'creator' || user?.role === 'seller' || user?.role === 'admin' ? (
                <SidebarItem 
                  icon={<Package size={18} />} 
                  label="My Products" 
                  onClick={() => navigate("/seller/" + user?.id)} 
                />
              ) : null}
              <SidebarItem 
                icon={<Settings size={18} />} 
                label="Settings" 
                onClick={() => navigate("/settings/profile")} 
              />
            </nav>
          </div>

          <div className="mt-4 px-2">
             <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-6 font-sans">Actions</h2>
             <nav className="space-y-2">
               <button 
                  onClick={() => navigate("/create-product")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-white bg-[#0071e3] rounded-xl hover:bg-[#0077ed] transition-all shadow-md shadow-blue-100 active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>Publish Asset</span>
                </button>
                <button 
                  onClick={fetchAnalytics}
                  disabled={refreshing}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                  <span>{refreshing ? "Syncing..." : "Sync Data"}</span>
                </button>
             </nav>
          </div>

          <div className="mt-auto p-2">
             <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600 overflow-hidden border border-gray-50">
                        {user?.profile_image_url ? <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" /> : user?.name?.[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role}</p>
                    </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full py-2.5 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
             </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2 font-sans">Workspace</h1>
                <p className="text-gray-500 text-sm font-medium">Welcome back, {user?.name.split(' ')[0]}. Monitoring your performance.</p>
              </div>

              <div className="flex bg-gray-200/50 p-1.5 rounded-2xl">
                <button 
                    onClick={() => setActiveView("creator")}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'creator' ? 'bg-white shadow-md text-[#1d1d1f]' : 'text-gray-500 hover:text-[#1d1d1f]'}`}
                >
                    Seller
                </button>
                <button 
                    onClick={() => setActiveView("buyer")}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'buyer' ? 'bg-white shadow-md text-[#1d1d1f]' : 'text-gray-500 hover:text-[#1d1d1f]'}`}
                >
                    Buyer
                </button>
              </div>
            </header>

            {activeView === 'creator' ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AppleStatCard 
                        label="Total Revenue" 
                        value={`₹${analytics?.creator?.overview?.totalRevenue?.toLocaleString() || 0}`} 
                        icon={<DollarSign size={20} className="text-blue-500" />}
                        trend={analytics?.creator?.overview?.totalRevenue > 0 ? "+100% initial growth" : null}
                    />
                    <AppleStatCard 
                        label="Available Balance" 
                        value={`₹${analytics?.creator?.overview?.availableBalance?.toLocaleString() || 0}`} 
                        icon={<Wallet size={20} className="text-green-500" />}
                    />
                    <AppleStatCard 
                        label="Published Assets" 
                        value={analytics?.creator?.overview?.productCount || 0} 
                        icon={<Package size={20} className="text-purple-500" />}
                    />
                    <AppleStatCard 
                        label="Completed Sales" 
                        value={analytics?.creator?.overview?.salesCount || 0} 
                        icon={<ShoppingBag size={20} className="text-pink-500" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold">Revenue Projections</h3>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Timeline: 7 Days</p>
                            </div>
                            <div className="px-3 py-1.5 bg-blue-50 rounded-full text-[10px] font-bold text-[#0071E3] flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse"></div>
                                LIVE ANALYTICS
                            </div>
                        </div>
                        <div className="h-[340px] w-full">
                            {salesTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrendData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                          dataKey="date" 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{fontSize: 11, fill: '#8e8e93', fontWeight: 500}} 
                                          dy={15}
                                          tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {weekday: 'short'})}
                                        />
                                        <YAxis 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{fontSize: 11, fill: '#8e8e93', fontWeight: 500}} 
                                          dx={-10}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                                borderRadius: '16px',
                                                border: '1px solid #f2f2f7',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backdropFilter: 'blur(8px)'
                                            }}
                                            cursor={{ stroke: '#0071E3', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#0071E3" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorRev)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full rounded-[2rem] bg-gray-50/50 border border-dashed border-gray-200 flex flex-col items-center justify-center">
                                    <Activity size={40} className="text-gray-200 mb-4" />
                                    <p className="text-sm font-bold text-gray-400">Syncing with marketplace events...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vault Balance Radial */}
                    <div className="bg-[#1d1d1f] rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col items-center">
                        <h3 className="text-xl font-bold self-start mb-2">Vault Balance</h3>
                        <p className="text-sm text-gray-400 self-start mb-8 font-medium">Earned vs Available for payout.</p>
                        
                        <div className="relative w-full h-[240px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius="60%" 
                                    outerRadius="100%" 
                                    barSize={15} 
                                    data={radialData}
                                    startAngle={180}
                                    endAngle={-180}
                                >
                                    <RadialBar
                                        minAngle={15}
                                        background
                                        clockWise
                                        dataKey="value"
                                        cornerRadius={10}
                                    />
                                    <Tooltip />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-3xl font-bold tracking-tighter">₹{analytics?.creator?.overview?.totalEarnings?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-4 mb-8">
                            <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#0071E3]"></div>
                                    <span className="text-xs font-bold text-gray-400">Available</span>
                                </div>
                                <span className="text-sm font-bold">₹{analytics?.creator?.overview?.availableBalance?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#AF52DE]"></div>
                                    <span className="text-xs font-bold text-gray-400">Pending</span>
                                </div>
                                <span className="text-sm font-bold">₹{analytics?.creator?.overview?.pendingPayouts?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <button className="w-full py-4.5 bg-[#0071e3] text-white rounded-[1.25rem] font-bold text-sm hover:bg-[#0077ed] transition-all transform active:scale-[0.98] shadow-lg shadow-blue-900/40">
                            Transfer to Bank
                        </button>
                    </div>
                </div>

                {/* Best Performing Bar Chart */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-bold">Top Performing Assets</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">Revenue distribution per product license.</p>
                        </div>
                        <button className="px-6 py-2.5 bg-gray-50 rounded-xl text-sm font-bold text-[#0071E3] hover:bg-blue-50 transition-colors">Performance Report</button>
                    </div>

                    <div className="h-[300px] w-full items-end flex">
                        {topProductsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f7" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#8e8e93', fontWeight: 600}} 
                                        interval={0}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#8e8e93', fontWeight: 600}} 
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#f2f2f7', radius: 12}}
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', fontWeight: 'bold'}}
                                    />
                                    <Bar 
                                        dataKey="revenue" 
                                        radius={[12, 12, 0, 0]} 
                                        barSize={60}
                                        animationBegin={300}
                                        animationDuration={1500}
                                    >
                                        {topProductsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full rounded-[2rem] bg-gray-50/50 flex items-center justify-center border border-dashed border-gray-200">
                                <p className="text-sm font-bold text-gray-400 italic font-sans px-8 text-center">Charts will populate dynamically once asset licenses are acquired.</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Buyer View Hub */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <AppleStatCard 
                        label="Portfolio Value" 
                        value={`₹${analytics?.user?.totalSpent?.toLocaleString() || 0}`} 
                        icon={<CreditCard size={20} className="text-[#0071E3]" />}
                    />
                    <AppleStatCard 
                        label="Acquired Assets" 
                        value={analytics?.user?.purchaseCount || 0} 
                        icon={<Library size={20} className="text-[#AF52DE]" />}
                    />
                    <AppleStatCard 
                        label="System Rating" 
                        value="A+" 
                        icon={<Zap size={20} className="text-[#FF9500]" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Buyer History */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold">Recent Acquisitions</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Registry Flow</p>
                            </div>
                            <button onClick={() => navigate("/library")} className="text-sm text-[#0071e3] font-bold hover:underline flex items-center gap-1.5">
                                Open Vault <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {analytics?.user?.purchases?.length > 0 ? analytics.user.purchases.slice(0, 5).map((p) => (
                                <div key={p.id} className="p-4 rounded-[1.5rem] bg-[#fbfbfb] border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 group-hover:shadow-md transition-shadow">
                                            {p.products?.image_url?.[0] ? (
                                                <img src={p.products.image_url[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={20} /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm truncate">{p.products?.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-500 font-bold">{new Date(p.purchased_at).toLocaleDateString()}</span>
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                <span className="text-[10px] text-green-600 font-bold uppercase">LICENSED</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-extrabold text-[#1d1d1f]">₹{p.amount}</p>
                                        <button 
                                            onClick={() => navigate(`/download/${p.id}`)}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-[#0071E3] hover:bg-blue-50 transition-colors"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center rounded-[2rem] bg-gray-50/50 border border-dashed border-gray-200">
                                    <ShoppingBag size={40} className="mx-auto mb-4 text-gray-200" />
                                    <p className="text-sm font-bold text-gray-400">Your asset vault is empty.</p>
                                    <button onClick={() => navigate('/browse')} className="mt-8 px-8 py-3 bg-[#0071e3] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-100 transition-all">Explore Marketplace</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Investment Mix Bar Chart */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-2">Portfolio Allocation</h3>
                        <p className="text-sm text-gray-400 font-medium mb-10">Asset distribution by category.</p>
                        
                        <div className="h-[300px] w-full">
                            {buyerCategoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={buyerCategoryData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#8e8e93'}} width={80} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} />
                                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={25}>
                                            {buyerCategoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                    <BarChart2 size={40} className="text-gray-100 mb-4" />
                                    <p className="text-sm font-bold text-gray-300">Allocation data will sync upon first acquisition.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <div className="p-6 rounded-3xl bg-[#0071E3]/5 border border-[#0071E3]/10">
                                <p className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest mb-2">Market Sentiment</p>
                                <p className="text-sm font-semibold text-gray-600 leading-relaxed">Systematic acquisition patterns suggest high focus on <span className="text-[#1d1d1f] font-bold underline decoration-[#0071E3]/30 decoration-4 underline-offset-4">{buyerCategoryData[0]?.name || "Uncategorized"}</span> assets.</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active 
          ? "bg-[#0071e3] text-white shadow-lg shadow-blue-200" 
          : "text-gray-500 hover:bg-gray-100 hover:text-[#1d1d1f] active:scale-[0.98]"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-sans tracking-tight">{label}</span>
    </button>
  );
}

function AppleStatCard({ label, value, icon, trend }) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all shadow-inner">
          {icon}
        </div>
        {trend && <span className="text-[10px] font-extrabold text-green-500 bg-green-50/50 px-2.5 py-1.5 rounded-lg border border-green-100">{trend}</span>}
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{value}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
    </div>
  );
}
