import { Router } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

// Add Razorpay webhook if needed in the future
router.post("/razorpay", async (req, res) => {
  try {
    // Razorpay webhook implementation
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ error: error.message }, "Razorpay webhook error");
    res.status(500).json({ error: "Webhook failed" });
  }
});

export default router;