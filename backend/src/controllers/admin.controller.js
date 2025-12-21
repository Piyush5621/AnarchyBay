import { supabase } from "../lib/supabase.js";
import { transporter } from "../lib/mailer.js";
// ✅ Import the services
import { getContactMessagesService, replyToMessageService } from "../services/contact.service.js";

// ================= STATS DASHBOARD =================
// ... existing imports

export const getStats = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalPurchases },
      { data: recentPurchases },
      { data: topProducts },
      { data: recentUsers },
      // 1. Fetch all sales data instead of calling .rpc()
      { data: allSales } 
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('purchases').select('*', { count: 'exact', head: true }),
      
      supabase.from('purchases')
        .select('*, products(name, price, currency), profiles!purchases_customer_id_fkey(name, email)')
        .order('purchased_at', { ascending: false })
        .limit(10),

      supabase.from('products')
        .select('*, profiles(name, email)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
        
      // 2. CHANGE THIS LINE: Select the price/amount column from your purchases table
      // If your 'purchases' table relies on 'products' for price, use: .select('products(price)')
      supabase.from('purchases').select('price') 
    ]);

    // 3. Calculate the sum manually in JavaScript
    // Note: Ensure 'item.price' matches your database column name (e.g. 'amount', 'total_price')
    const totalRevenueCalc = allSales?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;

    return res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalPurchases: totalPurchases || 0,
        totalRevenue: totalRevenueCalc, // 4. Use the calculated value
      },
      recentPurchases: recentPurchases || [],
      topProducts: topProducts || [],
      recentUsers: recentUsers || [],
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// ================= USER MANAGEMENT =================
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { data: users, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    return res.json({ 
      users, 
      total: count, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'seller', 'creator', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (req.user?.id === req.params.id && role !== 'admin') {
      return res.status(403).json({ error: "You cannot remove your own admin privileges." });
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
};

// ================= PRODUCT MANAGEMENT =================
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { data: products, count } = await supabase
      .from('products')
      .select('*, profiles(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    return res.json({ 
      products, 
      total: count, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const toggleProductFeatured = async (req, res) => {
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
};

export const deactivateProduct = async (req, res) => {
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
};

export const activateProduct = async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Product reactivated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reactivate product' });
  }
};

// ================= CONTACT MESSAGES (UPDATED) =================
export const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // ✅ REFACTORED: Now uses the shared Service Layer
    const { data, count } = await getContactMessagesService({ 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    return res.json({
      success: true,
      messages: data || [],
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Admin contact fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch contact messages" });
  }
};

export const replyToContactMessage = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage?.trim()) {
    return res.status(400).json({ message: "Reply message required" });
  }

  try {
    // 1. Fetch message details (needed for email address)
    const { data: msg, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 2. Send email via Transporter
    await transporter.sendMail({
      from: `"AnarchyBay Support" <${process.env.SMTP_USER}>`,
      to: msg.email,
      subject: `Re: ${msg.subject || "Your message to AnarchyBay"}`,
      text: replyMessage,
    });

    // 3. ✅ REFACTORED: Use Service to update Database status
    await replyToMessageService(id, replyMessage);

    return res.json({ success: true, message: "Reply sent successfully" });
  } catch (err) {
    console.error("Reply error:", err);
    return res.status(500).json({ message: "Failed to send reply" });
  }
};