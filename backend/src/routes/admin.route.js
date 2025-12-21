import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import { transporter } from "../lib/mailer.js";
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
    
    const { data: users, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    return res.json({ users, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
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

// ✅ NEW: Reactivate (Unban) a product
router.put("/products/:id/activate", requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: true }) // Set back to TRUE
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Product reactivated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reactivate product' });
  }
});

// ================= CONTACT MESSAGES =================
// Get all contact messages (Admin)
router.get(
  "/contact-messages",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.json({
        success: true,
        messages: data || [],
      });
    } catch (error) {
      console.error("Admin contact fetch error:", error);
      return res.status(500).json({
        error: "Failed to fetch contact messages",
      });
    }
  }
);

// Reply to a contact message (Admin)
router.post(
  "/contact-messages/:id/reply",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { replyMessage } = req.body;

    // 1️⃣ Validate
    if (!replyMessage?.trim()) {
      return res.status(400).json({ message: "Reply message required" });
    }

    try {
      // 2️⃣ Fetch message from DB
      const { data: msg, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !msg) {
        return res.status(404).json({ message: "Message not found" });
      }

      // 3️⃣ Send email
      await transporter.sendMail({
        from: `"AnarchyBay Support" <${process.env.SMTP_USER}>`,
        to: msg.email,
        subject: `Re: ${msg.subject || "Your message to AnarchyBay"}`,
        text: replyMessage,
      });

      // 4️⃣ ✅ UPDATE DB (THIS IS THE LINE YOU ASKED ABOUT)
      await supabase
        .from("contact_messages")
        .update({
          replied_at: new Date().toISOString(),
          reply_message: replyMessage,
        })
        .eq("id", id);

      // 5️⃣ Respond success
      return res.json({
        success: true,
        message: "Reply sent successfully",
      });
    } catch (err) {
      console.error("Reply error:", err);
      return res.status(500).json({
        message: "Failed to send reply",
      });
    }
  }
);


export default router;

