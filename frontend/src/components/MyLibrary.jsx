import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import api from '@/lib/api/client';

export default function MyLibrary() {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSeller = user?.role === 'seller';

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/resources/recent', { requireAuth: false }).catch(() => null);
      if (res && Array.isArray(res)) {
        if (isSeller && user?.id) {
          setItems(res.filter(r => r.owner_id === user.id));
        } else {
          setItems(res);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [isSeller, user]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/api/resources/${itemId}`, { requireAuth: true });
      alert('Deleted successfully');
      fetchItems(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Library</h1>
        <div className="text-sm text-muted-foreground">{isSeller ? 'Manage your inventory' : 'Saved resources & downloads'}</div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No items yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <LibraryCard key={item.id || item.storage_path} item={item} isSeller={isSeller} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LibraryCard({ item, isSeller, onDelete }){
  return (
    <div className="rounded-xl p-4 bg-background border border-border shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center text-2xl">📦</div>
        <div className="flex-1">
          <div className="font-semibold">{item.title || item.name || 'Untitled'}</div>
          <div className="text-xs text-muted-foreground mt-1">{item.mime_type || item.type || 'file'} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-md bg-card border border-border text-sm">View</button>
          <button className="px-3 py-1 rounded-md border border-border text-sm">Download</button>
        </div>

        <div className="flex items-center gap-2">
          {isSeller ? (
            <>
              <button className="px-3 py-1 rounded-md text-sm border border-border">Edit</button>
              <button onClick={() => onDelete(item.id)} className="px-3 py-1 rounded-md text-sm text-red-500 hover:bg-red-50">Delete</button>
            </>
          ) : (
            <button className="px-3 py-1 rounded-md text-sm">❤️</button>
          )}
        </div>
      </div>
    </div>
  )
}
