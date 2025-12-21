import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/stats", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalPurchases },
      { data: recentPurchases },
      { data: topProducts },
      { data: recentUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('purchases').select('*', { count: 'exact', head: true }),
      supabase.from('purchases').select('*, products(name, price, currency), profiles!purchases_customer_id_fkey(name, email)').order('purchased_at', { ascending: false }).limit(10),
      supabase.from('products').select('*, profiles(name, email)').eq('is_active', true).order('created_at', { ascending: false }).limit(10),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    const { data: revenueData } = await supabase
      .from('purchases')
      .select('amount, currency')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

    return res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalPurchases: totalPurchases || 0,
        totalRevenue,
      },
      recentPurchases: recentPurchases || [],
      topProducts: topProducts || [],
      recentUsers: recentUsers || [],
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get("/users", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch users
    const { data: users, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Fetch earnings for these users
    const userIds = users.map(u => u.id);
    
    // Total sales and revenue per creator
    const { data: earningsData } = await supabase
      .from('purchases')
      .select('amount, platform_fee, creator_earnings, seller_id')
      .in('seller_id', userIds)
      .eq('status', 'completed');

    // Group earnings by creator
    const earningsMap = {};
    earningsData?.forEach(p => {
      const creatorId = p.seller_id;
      if (!earningsMap[creatorId]) {
        earningsMap[creatorId] = { totalSales: 0, totalEarnings: 0, salesCount: 0 };
      }
      earningsMap[creatorId].totalSales += parseFloat(p.amount);
      earningsMap[creatorId].totalEarnings += parseFloat(p.creator_earnings);
      earningsMap[creatorId].salesCount += 1;
    });

    // Merge earnings back to users
    const usersWithEarnings = users.map(user => ({
      ...user,
      stats: earningsMap[user.id] || { totalSales: 0, totalEarnings: 0, salesCount: 0 }
    }));

    return res.json({ users: usersWithEarnings, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put("/users/:id/role", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'seller', 'creator', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.get("/products", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { data: products, count } = await supabase
      .from('products')
      .select('*, profiles(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    return res.json({ products, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.put("/products/:id/featured", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { is_featured } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_featured })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete("/products/:id", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Product deactivated' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to deactivate product' });
  }
});

export default router;
