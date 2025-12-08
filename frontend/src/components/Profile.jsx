import { useAuth } from '@/hooks/auth/use-auth';
import useUserProfileInfo from '@/hooks/profile/use-user-profile-info';
import useTotalProducts from '@/hooks/products/use-total-products';

export default function Profile(){
  const { isAuthenticated, user, role } = useAuth();
  const profileQuery = useUserProfileInfo();
  const productsQuery = useTotalProducts();

  const loading = (!isAuthenticated) || profileQuery.isLoading || productsQuery.isLoading;
  const profile = profileQuery.data || null;
  const stats = { totalSales: 0, products: productsQuery.data ?? 0, revenue: 0 };

  const isSeller = role === 'seller';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">{(user?.name||'U').charAt(0)}</div>
            <div>
              <div className="font-semibold">{user?.name || profile?.name || 'Your Name'}</div>
              <div className="text-sm text-muted-foreground">{user?.email || profile?.email}</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full py-2 rounded-md bg-primary text-primary-foreground">Edit Profile</button>
            {isSeller && <button className="w-full py-2 rounded-md border border-border">Edit Store</button>}
          </div>
        </div>

        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">{isSeller ? 'Store Analytics' : 'Account Summary'}</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-background border border-border">
                <div className="text-sm text-muted-foreground">Products</div>
                <div className="text-xl font-bold">{stats.products}</div>
              </div>
              <div className="rounded-xl p-4 bg-background border border-border">
                <div className="text-sm text-muted-foreground">Sales</div>
                <div className="text-xl font-bold">{stats.totalSales}</div>
              </div>
              <div className="rounded-xl p-4 bg-background border border-border">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-xl font-bold">₹{stats.revenue}</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{profile?.description || 'No description yet.'}</p>
          </div>

          {isSeller && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Social Links</h3>
              <div className="flex gap-2">
                <a className="px-3 py-1 rounded-md border border-border">Website</a>
                <a className="px-3 py-1 rounded-md border border-border">LinkedIn</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
