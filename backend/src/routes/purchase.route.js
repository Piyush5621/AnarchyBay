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

export default router;