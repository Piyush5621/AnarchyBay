import * as razorpayService from "../services/razorpay.service.js";
import { logger } from "../lib/logger.js";

export const createRazorpayOrderController = async (req, res) => {
  try {
    const { productId, productIds, variantId, discountAmount, discountCodeId } = req.body;
    const customerId = req.user.id;

    const result = await razorpayService.createRazorpayOrder({
      productId,
      productIds,
      variantId,
      customerId,
      discountAmount,
      discountCodeId,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error({ error: error.message }, "Error in createRazorpayOrderController");
    res.status(500).json({ error: error.message });
  }
};

export const verifyRazorpayPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const purchase = await razorpayService.verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.status(200).json({ success: true, purchase });
  } catch (error) {
    logger.error({ error: error.message }, "Error in verifyRazorpayPaymentController");
    res.status(500).json({ error: error.message });
  }
};
