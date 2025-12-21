import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, ShieldCheck, 
  Activity, ArrowUpRight, Search, Filter, MoreHorizontal, AlertTriangle,
  Zap, Database, Globe
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#FFD600', '#FF00FF', '#00FFFF', '#00FF00', '#FF5733'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'admin')) {
      toast.error("UNAUTHORIZED ACCESS DETECTED");
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
      toast.error("CRITICAL DATA FETCH FAILURE");
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="border-8 border-red-600 p-10 bg-white shadow-[20px_20px_0px_0px_rgba(220,38,38,1)]">
          <p className="text-4xl font-black uppercase italic animate-pulse">Scanning Authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yellow-50)] text-black font-sans selection:bg-black selection:text-white">
      <NavBar />
      
      <div className="flex pt-20 h-screen">
        {/* Admin Sidebar */}
        <aside className="w-80 bg-white border-r-4 border-black hidden lg:flex flex-col fixed h-full z-10 p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 mt-2 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black text-white">
            <ShieldCheck size={32} className="text-red-500" />
            <span className="text-2xl font-black uppercase italic tracking-tighter">BASE_COMMAND</span>
          </div>

          <nav className="space-y-4 flex-1">
            <AdminSidebarItem 
              icon={<Activity size={24} strokeWidth={3} />} 
              label="Fleet Overview" 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
            />
            <AdminSidebarItem 
              icon={<Users size={24} strokeWidth={3} />} 
              label="Entity Control" 
              active={activeTab === "users"} 
              onClick={() => setActiveTab("users")} 
            />
            <AdminSidebarItem 
              icon={<Package size={24} strokeWidth={3} />} 
              label="Asset Registry" 
              active={activeTab === "products"} 
              onClick={() => setActiveTab("products")} 
            />
          </nav>
          
          <div className="mt-8 border-4 border-black bg-red-600 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-4 border-white bg-black flex items-center justify-center font-black text-2xl">
                OA
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm uppercase truncate">Anarchy_Admin_01</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Status: GOD_MODE</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 lg:ml-80 overflow-y-auto p-6 md:p-10 lg:p-14">
          <div className="max-w-7xl mx-auto">
            <header className="mb-14 border-b-8 border-black pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-4 italic">COMMAND</h1>
                <p className="text-3xl font-bold bg-black text-white border-4 border-black px-6 py-2 inline-block shadow-[8px_8px_0px_0px_rgba(255,214,0,1)]">
                  ANARCHY_BAY_V.1.0
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                    <Database size={20} className="text-green-600" />
                    <span className="font-black text-xs uppercase">DB_SYNC_OK</span>
                </div>
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    <span className="font-black text-xs uppercase">EDGE_ACTIVE</span>
                </div>
              </div>
            </header>

            {dataLoading ? (
              <div className="grid place-items-center h-96 border-8 border-dashed border-black bg-white">
                <div className="text-center">
                  <Zap size={64} className="animate-bounce mx-auto mb-4 text-[var(--yellow-400)]" strokeWidth={3} />
                  <p className="text-4xl font-black uppercase italic">PILING_DATA...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && stats && (
                  <div className="space-y-16 animate-in fade-in duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <AdminStatCard title="Total GMV" value={`₹${stats.totalGMV.toLocaleString()}`} icon={<DollarSign size={28} strokeWidth={3}/>} color="bg-[var(--yellow-400)]" />
                      <AdminStatCard title="Protocol Rev" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<TrendingUp size={28} strokeWidth={3}/>} color="bg-[var(--pink-300)]" />
                      <AdminStatCard title="Global Users" value={stats.totalUsers} icon={<Users size={28} strokeWidth={3}/>} color="bg-[var(--cyan-400)]" />
                      <AdminStatCard title="Live Assets" value={stats.totalProducts} icon={<Package size={28} strokeWidth={3}/>} color="bg-[var(--green-400)]" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Revenue Performance */}
                        <div className="lg:col-span-8 bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-between mb-12">
                            <h3 className="text-4xl font-black uppercase italic tracking-tight">Revenue Stream</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-black border-2 border-black"></div>
                                    <span className="text-xs font-black uppercase">Gross</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[var(--pink-500)] border-2 border-black"></div>
                                    <span className="text-xs font-black uppercase">Net</span>
                                </div>
                            </div>
                          </div>
                          <div className="h-[400px] w-full">
                              <AreaChart data={stats.revenueChart} width={800} height={400}>
                                <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} vertical={false} />
                                <XAxis dataKey="date" axisLine={{stroke: '#000', strokeWidth: 4}} tick={{fill: '#000', fontWeight: 'bold'}} />
                                <YAxis axisLine={{stroke: '#000', strokeWidth: 4}} tick={{fill: '#000', fontWeight: 'bold'}} />
                                <Tooltip contentStyle={{backgroundColor: '#000', border: '4px solid #fff', color: '#fff', fontWeight: 'black', textTransform: 'uppercase'}} />
                                <Area type="step" dataKey="revenue" stroke="#000" strokeWidth={8} fill="#FFD600" fillOpacity={1} />
                                <Area type="step" dataKey="platform_fee" stroke="#FF00FF" strokeWidth={4} fill="transparent" />
                              </AreaChart>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="lg:col-span-4 bg-[var(--pink-300)] border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                          <h3 className="text-3xl font-black uppercase text-center mb-10 bg-white border-4 border-black p-4">Market Share</h3>
                          <div className="h-[350px] w-full flex justify-center">
                              <PieChart width={300} height={350}>
                                <Pie
                                  data={[
                                    { name: 'GMV', value: stats.totalGMV },
                                    { name: 'Protocol', value: stats.totalRevenue }
                                  ]}
                                  cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={0} dataKey="value"
                                  stroke="#000" strokeWidth={4}
                                >
                                  <Cell fill="#00FFFF" />
                                  <Cell fill="#FF00FF" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Transaction Log */}
                        <div className="bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                          <h3 className="text-4xl font-black uppercase italic mb-10 flex items-center gap-4">
                            <Zap size={32} className="text-[var(--yellow-400)]" strokeWidth={3} /> RECENT_TRAFFIC
                          </h3>
                          <div className="space-y-6">
                            {stats.purchases.slice(0, 6).map((p, i) => (
                              <div key={i} className="flex items-center justify-between p-6 bg-[var(--yellow-50)] border-4 border-black hover:bg-white transition-all transform hover:-translate-y-1">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-black border-4 border-black text-white flex items-center justify-center font-black text-xl italic">TX</div>
                                  <div>
                                    <p className="text-2xl font-black italic tracking-tighter">₹{p.amount}</p>
                                    <p className="text-[10px] bg-black text-white px-2 inline-block font-black uppercase">{new Date(p.purchased_at).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black uppercase text-pink-600">CUT: ₹{p.platform_fee}</p>
                                  <div className="mt-1 flex items-center gap-1">
                                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                      <span className="text-[10px] font-black uppercase">VALIDATED</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-[var(--cyan-400)] border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10 flex space-x-2 p-1">
                              <div className="w-full h-full bg-white animate-ping"></div>
                          </div>
                          <div className="w-32 h-32 bg-white border-8 border-black rounded-full flex items-center justify-center mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                             <ShieldCheck size={64} className="text-green-600" strokeWidth={3} />
                          </div>
                          <h3 className="text-5xl font-black uppercase italic mb-4 tracking-tighter leading-none">SYSTEM_GREEN</h3>
                          <p className="text-xl font-bold max-w-[400px] uppercase bg-black text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            All protocol parameters within expected limits. Cloud database sync nominal. 
                          </p>
                          <div className="mt-10 grid grid-cols-3 gap-4 w-full">
                              <div className="p-4 border-4 border-black bg-white font-black text-xs uppercase">CPU: 12%</div>
                              <div className="p-4 border-4 border-black bg-white font-black text-xs uppercase">RAM: 4.2G</div>
                              <div className="p-4 border-4 border-black bg-white font-black text-xs uppercase">NET: STABLE</div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="bg-white border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-10 border-b-8 border-black flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--yellow-400)]">
                       <h3 className="text-5xl font-black uppercase italic tracking-tighter">Entity_Base</h3>
                       <div className="flex gap-4 w-full md:w-auto">
                          <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} strokeWidth={3} />
                            <input type="text" placeholder="QUERY_ENTITY..." className="w-full md:w-80 pl-14 pr-6 py-4 bg-white border-4 border-black font-black uppercase text-sm focus:bg-[var(--cyan-400)] outline-none" />
                          </div>
                          <button className="bg-black text-white p-4 border-4 border-black hover:bg-[var(--pink-500)] transition-colors">
                              <Filter size={24} strokeWidth={3} />
                          </button>
                       </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-black text-white text-xs font-black uppercase tracking-[0.2em]">
                          <tr>
                            <th className="px-10 py-6 border-r-4 border-white/20">Identity_signature</th>
                            <th className="px-10 py-6 border-r-4 border-white/20 text-center">Protocol_clearence</th>
                            <th className="px-10 py-6 border-r-4 border-white/20">Registration_epoch</th>
                            <th className="px-10 py-6 text-right">Access_ports</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-8 divide-black bg-white">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--cyan-50)] transition-colors">
                              <td className="px-10 py-8 border-r-8 border-black">
                                <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 border-4 border-black bg-[var(--pink-300)] flex items-center justify-center font-black text-2xl italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    {(user.name || 'A')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-2xl font-black uppercase border-b-4 border-black mb-1">{user.name || 'DE-IDENTIFIED'}</p>
                                    <p className="text-xs font-black bg-black text-white px-2 py-0.5 inline-block">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-8 border-r-8 border-black text-center">
                                <span className={`px-4 py-2 border-4 border-black text-sm font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                  user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-[var(--green-400)] text-black'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-10 py-8 border-r-8 border-black font-black text-lg italic">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-10 py-8 text-right">
                                <button className="p-4 bg-black text-white border-4 border-black hover:bg-[var(--yellow-400)] hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(255,0,255,1)]">
                                  <MoreHorizontal size={28} strokeWidth={3} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-500">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-8px] hover:translate-y-[-8px] hover:shadow-[20px_20px_0px_0px_rgba(255,214,0,1)] transition-all flex flex-col group">
                        <div className="aspect-video bg-black border-4 border-black mb-8 overflow-hidden relative">
                           {product.thumbnail_url ? (
                             <img src={product.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-[var(--pink-300)]">
                               <Package className="text-black" size={64} strokeWidth={3} />
                             </div>
                           )}
                           <div className="absolute top-4 left-4 bg-white border-4 border-black px-2 py-1 font-black text-[10px] uppercase">Asset_ID: {product.id.slice(0,6)}</div>
                        </div>
                        <h4 className="text-3xl font-black uppercase mb-2 truncate italic border-b-4 border-black pb-2 leading-none">{product.name}</h4>
                        <p className="text-sm font-black uppercase text-black/40 mb-8 mt-2">Originated_by: <span className="text-black italic">{product.profiles?.name || 'UNLISTED'}</span></p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="bg-black text-white px-4 py-2 border-4 border-black">
                            <span className="text-3xl font-black italic">₹{product.price}</span>
                          </div>
                          <span className={`px-4 py-1 border-4 border-black text-xs font-black uppercase ${product.is_active ? 'bg-[var(--green-400)] text-black' : 'bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                            {product.is_active ? 'ENABLED' : 'HALTED'}
                          </span>
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
      className={`w-full flex items-center gap-4 px-6 py-5 border-4 border-black font-black uppercase text-xl transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${
        active 
          ? "bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,214,0,1)] -translate-x-1 -translate-y-1" 
          : "bg-white text-black hover:bg-[var(--cyan-400)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function AdminStatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all group flex flex-col justify-between h-56`}>
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center font-black group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <div className="w-4 h-4 rounded-full bg-black animate-pulse" />
      </div>
      <div>
        <p className="text-xs font-black uppercase text-black/60 mb-1 border-b-2 border-black/20 pb-1">{title}</p>
        <p className="text-4xl font-black italic truncate tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
