import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import {
  updateUserRolesController,
  addRoleController,
  removeRoleController,
  setVerifiedSellerController,
  toggleAdminBadgeController,
  getAllUsersController
} from "../controllers/admin.controller.js";

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

// NEW: Get all users with roles and badges
router.get("/users/roles", requireAuth, requireRole('admin'), getAllUsersController);

// NEW: Update user roles (replace all)
router.put("/users/:userId/roles", requireAuth, requireRole('admin'), updateUserRolesController);

// NEW: Add a role to user
router.post("/users/:userId/roles/:role", requireAuth, requireRole('admin'), addRoleController);

// NEW: Remove a role from user
router.delete("/users/:userId/roles/:role", requireAuth, requireRole('admin'), removeRoleController);

// NEW: Set verified seller badge
router.put("/users/:userId/verified-seller", requireAuth, requireRole('admin'), setVerifiedSellerController);

// NEW: Toggle admin badge visibility
router.put("/users/:userId/admin-badge", requireAuth, requireRole('admin'), toggleAdminBadgeController);

// OLD: Get all users (keep for backward compatibility)
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

// Toggle product active status
router.put("/products/:id/toggle-active", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle product status' });
  }
});

// User account activation/deactivation
router.put("/users/:id/toggle-active", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// User restriction
router.put("/users/:id/restrict", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { is_restricted, restriction_reason } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        is_restricted, 
        restriction_reason: is_restricted ? restriction_reason : null,
        restricted_at: is_restricted ? new Date().toISOString() : null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user restriction' });
  }
});

// Get all product reports
router.get("/reports", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const query = supabase
      .from('product_reports')
      .select(`
        *,
        products(id, name, thumbnail_url, price, is_active, creator_id),
        profiles!product_reports_reporter_id_fkey(id, name, email),
        reviewed_by_profile:profiles!product_reports_reviewed_by_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) throw error;
    return res.json({ reports: reports || [] });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update report status
router.put("/reports/:id/status", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, admin_notes, action } = req.body;
    const adminId = req.user.id;

    const updateData = {
      status,
      admin_notes,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: report, error: reportError } = await supabase
      .from('product_reports')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, products(id)')
      .single();

    if (reportError) throw reportError;

    // If admin approves the report and wants to deactivate the product
    if (status === 'approved' && action === 'deactivate_product' && report.products) {
      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', report.products.id);
    }

    return res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    return res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
