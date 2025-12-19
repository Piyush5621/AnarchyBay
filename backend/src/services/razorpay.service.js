import { razorpayClient } from "../lib/razorpay.js";
import crypto from "crypto";
import { logger } from "../lib/logger.js";
import { supabase } from "../lib/supabase.js";
import { createPurchase, updatePurchase } from "../repositories/purchase.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import { findVariantById } from "../repositories/variant.repository.js";
import { generateLicenseKey, calculatePlatformFee } from "../lib/license.js";

export const createRazorpayOrder = async ({ productId, productIds, variantId, customerId, discountAmount = 0, discountCodeId = null }) => {
  let finalAmount = 0;
  let currency = "INR";
  const items = [];

  if (productIds && Array.isArray(productIds)) {
    for (const id of productIds) {
      const { data: product, error: productError } = await findProductById(id);
      if (productError) {
        throw new Error(`Database error for product ${id}: ${productError.message}`);
      }
      if (!product) {
        throw new Error(`Product ${id} not found. Please remove invalid items from your cart.`);
      }
      if (!product.is_active) {
        throw new Error(`Product ${id} is no longer available. Please remove it from your cart.`);
      }
      finalAmount += parseFloat(product.price);
      currency = product.currency || "INR";
      items.push(product);
    }
  } else if (productId) {
    const { data: product, error: productError } = await findProductById(productId);
    if (productError) {
      throw new Error(`Database error for product ${productId}: ${productError.message}`);
    }
    if (!product) {
      throw new Error("Product not found. Please check if the product still exists.");
    }
    if (!product.is_active) {
      throw new Error("Product is no longer available.");
    }
    let price = parseFloat(product.price);
    if (variantId) {
      const { data: variant, error: variantError } = await findVariantById(variantId);
      if (variantError) throw new Error(`Database error for variant: ${variantError.message}`);
      if (!variant) throw new Error("Variant not found");
      price = parseFloat(variant.price);
    }
    finalAmount = price;
    currency = product.currency || "INR";
    items.push(product);
  } else {
    throw new Error("No products specified");
  }

  finalAmount = Math.max(0, finalAmount - discountAmount);
  const amountInPaise = Math.round(finalAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: currency,
    receipt: `receipt_${Date.now()}`,
  };

  if (!razorpayClient) {
    // For development/testing, return a mock order when using test credentials
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_your_test_key_id' &&
        process.env.RAZORPAY_KEY_SECRET === 'your_test_key_secret') {
      logger.warn("Using mock Razorpay response for development/testing");

      const mockOrderId = `order_mock_${Date.now()}`;
      const purchaseIds = [];

      for (const item of items) {
        const itemAmount = parseFloat(item.price);
        const platformFee = calculatePlatformFee(itemAmount);
        const creatorEarnings = itemAmount - platformFee;
        const licenseKey = generateLicenseKey();

        const { data: purchase, error: purchaseError } = await createPurchase({
          customer_id: customerId,
          product_id: item.id,
          seller_id: item.creator_id,
          variant_id: (productId === item.id) ? (variantId || null) : null,
          payment_provider: "razorpay",
          razorpay_order_id: mockOrderId,
          amount: itemAmount,
          currency: currency,
          platform_fee: platformFee,
          creator_earnings: creatorEarnings,
          license_key: licenseKey,
          status: "pending",
          discount_code_id: (productId === item.id) ? discountCodeId : null,
          discount_amount: (productId === item.id) ? discountAmount : 0,
        });

        if (purchaseError) {
          logger.error({ error: purchaseError, item, customerId }, "Failed to create purchase record in mock mode");
          throw new Error(`Failed to create purchase record for product ${item.id}: ${purchaseError.message}`);
        }
        purchaseIds.push(purchase.id);
      }

      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: currency,
        purchaseId: purchaseIds[0],
        purchaseIds: purchaseIds,
        isMock: true, // Flag to indicate this is a mock response
      };
    }

    throw new Error("Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file");
  }

  try {
    const order = await razorpayClient.orders.create(options);
    const purchaseIds = [];

    for (const item of items) {
      const itemAmount = parseFloat(item.price);
      const platformFee = calculatePlatformFee(itemAmount);
      const creatorEarnings = itemAmount - platformFee;
      const licenseKey = generateLicenseKey();

        const { data: purchase, error: purchaseError } = await createPurchase({
          customer_id: customerId,
          product_id: item.id,
          seller_id: item.creator_id,
          variant_id: (productId === item.id) ? (variantId || null) : null,
          payment_provider: "razorpay",
          razorpay_order_id: order.id,
          amount: itemAmount,
          currency: currency,
          platform_fee: platformFee,
          creator_earnings: creatorEarnings,
          license_key: licenseKey,
          status: "pending",
          discount_code_id: (productId === item.id) ? discountCodeId : null,
          discount_amount: (productId === item.id) ? discountAmount : 0,
        });

      if (purchaseError) {
        logger.error({ error: purchaseError, item, customerId }, "Failed to create purchase record");
        throw new Error(`Failed to create purchase record for product ${item.id}: ${purchaseError.message}`);
      }
      purchaseIds.push(purchase.id);
    }

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purchaseId: purchaseIds[0], // For backward compatibility
      purchaseIds: purchaseIds,
    };
  } catch (error) {
    logger.error({ error: error.message }, "Razorpay order creation failed");
    throw error;
  }
};

export const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in your .env file");
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    throw new Error("Invalid payment signature");
  }

  // Find all purchases with this order ID
  const { data: purchases, error: findError } = await supabase
    .from("purchases")
    .select("id")
    .eq("razorpay_order_id", razorpay_order_id);

  if (findError || !purchases) {
    throw new Error("Purchases not found");
  }

  const results = [];
  for (const p of purchases) {
    const { data: updated, error: updateError } = await updatePurchase(p.id, {
      status: "completed",
      razorpay_payment_id: razorpay_payment_id,
      purchased_at: new Date().toISOString(),
    });
    if (updateError) throw new Error(`Failed to update purchase ${p.id}`);
    results.push(updated);
  }

  return results[0]; // Return the first one for compatibility
};
