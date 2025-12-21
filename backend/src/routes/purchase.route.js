import { Router } from "express";
import {
  initiatePurchaseController,
  completePurchaseController,
  getPurchaseController,
  getMyPurchasesController,
  getCreatorSalesController,
  checkPurchaseController,
  getPurchasesByOrderController,
} from "../controllers/purchase.controller.js";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
} from "../controllers/razorpay.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.post("/initiate", requireAuth, initiatePurchaseController);
router.post("/checkout/razorpay", requireAuth, createRazorpayOrderController);
router.post("/verify/razorpay", requireAuth, verifyRazorpayPaymentController);
router.post("/:purchaseId/complete", requireAuth, completePurchaseController);
router.get("/my", requireAuth, getMyPurchasesController);
router.get("/sales", requireAuth, requireCreator, getCreatorSalesController);
router.get("/check/:productId", requireAuth, checkPurchaseController);
router.get("/order/:orderId", requireAuth, getPurchasesByOrderController);
router.get("/:id", requireAuth, getPurchaseController);
// Mock Buy Route
router.post('/dev/mock-buy', requireAuth, async (req, res) => {
  console.log("--- MOCK BUY ATTEMPT START ---");
  try {
    const { productId } = req.body;
    
    // Safety check: Ensure user exists
    if (!req.user || !req.user.id) {
        console.error("❌ No User ID found in request");
        return res.status(401).json({ error: "User not authenticated" });
    }
    
    const userId = req.user.id;
    console.log(`👤 User: ${userId}, 📦 Product: ${productId}`);

    // 1. Check if 'supabase' is loaded
    if (!supabase) {
        console.error("❌ Supabase client is undefined. Check import path.");
        return res.status(500).json({ error: "Database configuration error" });
    }

    // 2. Fetch Product (Check if table is 'products' or 'product')
    const { data: product, error: productError } = await supabase
      .from('products') // ⚠️ CHECK: Is your table named 'products' or 'product'?
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error("❌ Product Fetch Error:", productError);
      return res.status(404).json({ error: "Product not found or DB error" });
    }

    if (!product) {
        console.error("❌ Product is null");
        return res.status(404).json({ error: "Product does not exist" });
    }

    console.log(`💰 Price found: ${product.price}`);

    // 3. Insert Purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases') // ⚠️ CHECK: Is your table named 'purchases' or 'purchase'?
      .insert([
        {
          user_id: userId,
          product_id: productId,
          amount: product.price,
          currency: product.currency || 'INR',
          status: 'completed',
          payment_id: `mock_${Date.now()}`,
          // provider: 'razorpay' // ⚠️ Comment this out if your DB doesn't have this column
        }
      ])
      .select()
      .single();

    if (purchaseError) {
      console.error("❌ Purchase Insert Error:", purchaseError);
      // Return the specific DB error to the frontend to help debug
      return res.status(500).json({ error: purchaseError.message });
    }

    console.log("✅ Success:", purchase);
    res.status(200).json({ success: true, purchase });

  } catch (error) {
    console.error("🔥 CRITICAL SERVER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;