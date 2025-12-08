import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import useTotalUsers from "@/hooks/profile/use-total-users";
import useUserProfileInfo from "@/hooks/profile/use-user-profile-info";
import useTotalProducts from "@/hooks/products/use-total-products";
import NavBar from "./NavBar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const totalUsersQuery = useTotalUsers();
  const profileQuery = useUserProfileInfo();
  const totalProductsQuery = useTotalProducts();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  const handleUploadClick = () => {
    // navigate to upload page or open file dialog (if implemented)
    navigate('/upload');
  };

  const onSearch = (e) => {
    const v = e.target.value;
    // Could integrate search API; for now navigate to explore with query
    // debounce would be nice; omitted for brevity
    navigate(`/explore?query=${encodeURIComponent(v)}`);
  };

  const loading = [
    totalUsersQuery.isLoading,
    profileQuery.isLoading,
    totalProductsQuery.isLoading,
  ].some(Boolean);

  const stats = {
    resources: totalProductsQuery.data ?? 0,
    totalUsers: totalUsersQuery.data ?? 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">BitShelf</div>
            <div className="hidden sm:block text-muted-foreground">Your marketplace for developer resources</div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-80">
              <input
                ref={searchRef}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(e)}
                placeholder="Search resources, authors, tags..."
                className="w-full rounded-full px-4 py-2 bg-card border border-border focus:ring-2 focus:ring-primary/30 outline-none transition"
              />
            </div>

            <button className="p-2 rounded-full bg-card border border-border hover:scale-105 transition" aria-label="Notifications">
              🔔
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border hover:shadow-sm transition"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">{(user?.name || 'U').charAt(0)}</div>
                <div className="hidden sm:block text-sm">{user?.name?.split(' ')[0] || 'You'}</div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    📋 View Profile
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-200"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <StatCard title="Total Resources" value={loading ? '...' : stats.resources} gradient="bg-linear-to-r from-indigo-500 to-pink-500" icon="📦" />
          <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers} gradient="bg-linear-to-r from-blue-500 to-purple-600" icon="👥" />
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Upload, manage and share your resources quickly.</p>

          <button onClick={handleUploadClick} className="mt-4 py-3 px-4 rounded-2xl text-white font-semibold shadow-lg transition transform hover:scale-105 bg-linear-to-r from-indigo-600 to-pink-600">
            ⬆️ Upload Resource
          </button>

          <button onClick={() => navigate('/products/new')} className="py-2 px-3 rounded-xl border border-border">Create Product</button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, gradient, icon }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
        <div className="text-3xl opacity-90">{icon}</div>
      </div>
    </div>
  );
}

// RecentItem component removed as Recent Resources section was removed
