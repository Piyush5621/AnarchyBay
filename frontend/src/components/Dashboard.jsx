import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import useUserProfileInfo from "@/hooks/profile/use-user-profile-info";
import NavBar from "./NavBar";
import { supabase } from "@/lib/supabase";
import { saveSessionTokens, getAccessToken } from "@/lib/api/client.js";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { 
  ShoppingBag, DollarSign, Package, Users, ArrowUpRight, ArrowDownRight, 
  BarChart2, PieChart as PieChartIcon, Activity, Plus, Library, Settings, LogOut,
  Wallet, TrendingUp, History
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = ['#FFD600', '#FF00FF', '#00FFFF', '#00FF00', '#FF5733', '#C70039'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const profileQuery = useUserProfileInfo();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
        window.location.reload();
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
      setLoading(true);
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
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-[var(--yellow-50)] flex items-center justify-center font-bold">
        <div className="text-center p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-12 h-12 border-8 border-black border-t-[var(--pink-500)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-2xl uppercase italic">SYST3M L0ADING...</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Purchases', A: analytics?.user?.purchaseCount || 0, fullMark: 10 },
    { subject: 'Sales', A: analytics?.creator?.overview?.salesCount || 0, fullMark: 10 },
    { subject: 'Products', A: analytics?.creator?.overview?.productCount || 0, fullMark: 10 },
    { subject: 'Revenue', A: Math.log10((analytics?.creator?.overview?.totalRevenue || 1)) * 2, fullMark: 10 },
    { subject: 'Library', A: analytics?.user?.purchases?.length || 0, fullMark: 10 },
  ];

  const spendingData = analytics?.user?.purchases?.reduce((acc, p) => {
    const date = new Date(p.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) existing.amount += parseFloat(p.amount);
    else acc.push({ date, amount: parseFloat(p.amount) });
    return acc;
  }, []).reverse().slice(-7) || [];

  return (
    <div className="min-h-screen bg-[var(--yellow-50)] text-black font-sans selection:bg-[var(--pink-500)] selection:text-white">
      <NavBar />
      
      <div className="flex h-screen pt-20">
        {/* Neo-Brutalist Sidebar */}
        <aside className="w-72 bg-white border-r-4 border-black hidden lg:flex flex-col fixed h-full z-10 p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 mt-2 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[var(--cyan-400)]">
            <span className="text-2xl font-black uppercase italic tracking-tighter">ANARCHY BAY</span>
          </div>
          
          <nav className="space-y-4 flex-1">
            <SidebarItem 
              icon={<Activity size={24} strokeWidth={3} />} 
              label="Overview" 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
            />
            <SidebarItem 
              icon={<Library size={24} strokeWidth={3} />} 
              label="My Library" 
              onClick={() => navigate("/library")} 
            />
            <SidebarItem 
              icon={<Package size={24} strokeWidth={3} />} 
              label="My Products" 
              onClick={() => navigate("/seller")} 
            />
            <SidebarItem 
              icon={<Plus size={24} strokeWidth={3} />} 
              label="Sell Item" 
              onClick={() => navigate("/create-product")} 
              variant="pink"
            />
            
            <div className="pt-6 mt-6 border-t-4 border-black">
              <SidebarItem 
                icon={<Settings size={24} strokeWidth={3} />} 
                label="Settings" 
                onClick={() => navigate("/profile")} 
              />
              <SidebarItem 
                icon={<LogOut size={24} strokeWidth={3} />} 
                label="Logout" 
                onClick={logout} 
              />
            </div>
          </nav>

          <div className="mt-8 border-4 border-black bg-[var(--yellow-400)] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1">User ID: #{user?.id?.slice(0, 8)}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm uppercase truncate">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 border border-black rounded-full animate-pulse" />
                  <p className="text-[10px] font-bold uppercase text-black/60 truncate">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-72 overflow-y-auto p-6 md:p-10 lg:p-14 bg-[var(--yellow-50)]">
          <div className="max-w-7xl mx-auto">
            <header className="mb-14 flex flex-col md:flex-row md:items-start justify-between gap-8 border-b-8 border-black pb-10">
              <div className="relative">
                <div className="absolute -top-6 -left-4 w-16 h-8 bg-[var(--pink-500)] border-4 border-black -rotate-12 flex items-center justify-center text-white text-xs font-black uppercase">Active</div>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
                  HELLO, <br/> {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-2xl font-bold bg-white border-4 border-black px-4 py-2 inline-block -rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  Welcome to the Anarchy.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate("/create-product")}
                  className="bg-[var(--pink-500)] text-white px-8 py-5 border-4 border-black font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={24} strokeWidth={4} /> Launch Product
                </button>
              </div>
            </header>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <BigStatCard 
                label="Purchases Total" 
                value={`₹${analytics?.user?.totalSpent?.toLocaleString() || 0}`} 
                color="bg-[var(--yellow-400)]"
                icon={<Wallet size={28} strokeWidth={3} />}
              />
              <BigStatCard 
                label="Creator Revenue" 
                value={`₹${analytics?.creator?.overview?.totalRevenue?.toLocaleString() || 0}`} 
                color="bg-[var(--cyan-400)]"
                icon={<TrendingUp size={28} strokeWidth={3} />}
              />
              <BigStatCard 
                label="Active Balance" 
                value={`₹${analytics?.creator?.overview?.availableBalance?.toLocaleString() || 0}`} 
                color="bg-[var(--green-400)]"
                icon={<DollarSign size={28} strokeWidth={3} />}
              />
              <BigStatCard 
                label="Conversion" 
                value="8.4%" 
                color="bg-[var(--pink-300)]"
                icon={<Activity size={28} strokeWidth={3} />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
              {/* Creator Earnings Detail */}
              <div className="lg:col-span-8 bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-3xl font-black uppercase italic border-b-4 border-black pb-2">Sales Momentum</h3>
                  <div className="p-3 border-4 border-black bg-[var(--yellow-400)] font-black text-sm uppercase">7-Day Analysis</div>
                </div>
                <div className="h-[400px] w-full bg-white flex items-center justify-center">
                    <AreaChart data={spendingData} width={800} height={400} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={{ stroke: '#000', strokeWidth: 4 }} 
                        tickLine={{ stroke: '#000', strokeWidth: 4 }} 
                        tick={{ fill: '#000', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        axisLine={{ stroke: '#000', strokeWidth: 4 }} 
                        tickLine={{ stroke: '#000', strokeWidth: 4 }} 
                        tick={{ fill: '#000', fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#000', 
                          border: '4px solid #fff', 
                          color: '#fff',
                          fontWeight: 'black',
                          textTransform: 'uppercase'
                        }}
                      />
                      <Area 
                        type="stepAfter" 
                        dataKey="amount" 
                        stroke="#FF00FF" 
                        strokeWidth={8} 
                        fill="#FFD600" 
                        fillOpacity={1} 
                      />
                    </AreaChart>
                </div>
              </div>

              {/* Activity Radar */}
              <div className="lg:col-span-4 bg-[var(--cyan-400)] border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase text-center mb-8 bg-white border-4 border-black p-2">Skill Matrix</h3>
                <div className="h-[300px] w-full flex justify-center">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} width={300} height={300}>
                      <PolarGrid stroke="#000" strokeWidth={2} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontWeight: 'black', fontSize: 12 }} />
                      <Radar
                        name="Usage"
                        dataKey="A"
                        stroke="#000"
                        strokeWidth={4}
                        fill="#FF00FF"
                        fillOpacity={0.8}
                      />
                    </RadarChart>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Recent Buys */}
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--pink-300)] border-l-4 border-b-4 border-black -mr-16 -mt-16 rotate-45 transform"></div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 border-4 border-black bg-[var(--green-400)]">
                    <History size={24} strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black uppercase">Recent Acquisitions</h3>
                </div>
                
                <div className="space-y-6">
                  {(analytics?.user?.purchases || []).slice(0, 4).map((p) => (
                    <div key={p.id} className="border-4 border-black p-4 bg-[var(--yellow-50)] flex items-center justify-between hover:bg-white transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 border-4 border-black flex items-center justify-center bg-white group-hover:bg-[var(--cyan-400)] transition-colors overflow-hidden">
                          {p.products?.image_url?.[0] ? (
                            <img src={p.products.image_url[0]} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="text-black" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-xl font-black uppercase leading-tight">{p.products?.name}</p>
                          <p className="text-xs font-bold uppercase text-black/40">{new Date(p.purchased_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black italic">₹{p.amount}</p>
                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">SECURED</span>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.user?.purchases || analytics.user.purchases.length === 0) && (
                    <div className="p-10 border-4 border-dashed border-black text-center bg-white">
                      <p className="text-xl font-black uppercase italic">Null Void_ No Data Found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Creator Sells */}
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 border-4 border-black bg-[var(--cyan-400)]">
                    <TrendingUp size={24} strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black uppercase">Creator Intel</h3>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="border-4 border-black bg-[var(--yellow-400)] p-4">
                    <p className="text-xs font-black uppercase border-b-2 border-black mb-2">Total Sales</p>
                    <p className="text-4xl font-black italic">{analytics?.creator?.overview?.salesCount || 0}</p>
                  </div>
                  <div className="border-4 border-black bg-[var(--pink-300)] p-4">
                    <p className="text-xs font-black uppercase border-b-2 border-black mb-2">Total Payouts</p>
                    <p className="text-4xl font-black italic">₹{analytics?.creator?.overview?.totalPayouts || 0}</p>
                  </div>
                </div>

                <div className="bg-black text-white p-6 border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase">Withdrawal Ready</p>
                      <p className="text-5xl font-black tracking-tight text-[var(--yellow-400)]">₹{analytics?.creator?.overview?.availableBalance || 0}</p>
                    </div>
                    <button className="bg-white text-black px-6 py-2 border-4 border-[var(--yellow-400)] font-black uppercase hover:bg-[var(--yellow-400)] transition-colors">
                      Eject Funds
                    </button>
                  </div>
                  <div className="w-full bg-white/20 h-2">
                    <div className="bg-[var(--yellow-400)] h-full w-3/4"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-black uppercase italic text-sm border-b-2 border-black pb-1">Top Selling Items</p>
                  {(analytics?.creator?.topProducts || []).slice(0, 3).map((prod) => (
                    <div key={prod.productId} className="flex items-center justify-between py-2">
                      <span className="font-bold uppercase flex-1 truncate">{prod.name}</span>
                      <div className="flex gap-4">
                        <span className="text-sm font-black bg-[var(--cyan-400)] px-2">{prod.salesCount} sold</span>
                        <span className="text-sm font-black italic">₹{prod.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, variant }) {
  const getStyle = () => {
    if (active) return "bg-black text-white shadow-[6px_6px_0px_0px_var(--pink-500)]";
    if (variant === "pink") return "bg-[var(--pink-500)] text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";
    return "bg-white text-black hover:bg-[var(--yellow-400)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 border-4 border-black font-black uppercase text-lg transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${getStyle()}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function BigStatCard({ label, value, color, icon }) {
  return (
    <div className={`${color} border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all group`}>
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 border-4 border-black bg-white group-hover:rotate-12 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-black uppercase text-black/70 mb-1 border-b-2 border-black/20 pb-1">{label}</p>
        <p className="text-4xl font-black italic tracking-tighter truncate">{value}</p>
      </div>
    </div>
  );
}
