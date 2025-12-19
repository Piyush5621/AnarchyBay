import {
  createPurchase as createPurchaseRepo,
  updatePurchase as updatePurchaseRepo,
  findPurchaseById,
  findPurchaseByLicenseKey,
  findPurchasesByCustomer,
  findPurchasesByProduct,
  findPurchasesByCreator,
  verifyPurchase,
} from "../repositories/purchase.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import { findVariantById } from "../repositories/variant.repository.js";
import { generateLicenseKey, calculatePlatformFee } from "../lib/license.js";
import { supabase } from "../lib/supabase.js";

export const createPurchase = async (purchaseData) => {
  const { data: product, error: productError } = await findProductById(purchaseData.productId);

  if (productError || !product) {
    return { error: { message: "Product not found", status: 404 } };
  }

  let price = parseFloat(product.price);
  let variantData = null;

  if (purchaseData.variantId) {
    const { data: variant, error: variantError } = await findVariantById(purchaseData.variantId);
    if (variantError || !variant) {
      return { error: { message: "Variant not found", status: 404 } };
    }
    price = parseFloat(variant.price);
    variantData = variant;
  }

  const discountAmount = purchaseData.discountAmount || 0;
  const finalAmount = price - discountAmount;
  const platformFee = calculatePlatformFee(finalAmount);
  const creatorEarnings = finalAmount - platformFee;

  const licenseKey = generateLicenseKey();

  const { data, error } = await createPurchaseRepo({
    customer_id: purchaseData.customerId,
    product_id: purchaseData.productId,
    variant_id: purchaseData.variantId || null,
    payment_provider: purchaseData.paymentProvider,
    stripe_payment_intent_id: purchaseData.stripePaymentIntentId || null,
    razorpay_order_id: purchaseData.razorpayOrderId || null,
    amount: finalAmount,
    currency: product.currency,
    platform_fee: platformFee,
    creator_earnings: creatorEarnings,
    license_key: licenseKey,
    status: purchaseData.status || "pending",
    discount_code_id: purchaseData.discountCodeId || null,
    discount_amount: discountAmount,
  });

  return { data, error };
};

export const completePurchase = async (purchaseId) => {
  return await updatePurchaseRepo(purchaseId, {
    status: "completed",
    purchased_at: new Date().toISOString(),
  });
};

export const refundPurchase = async (purchaseId) => {
  return await updatePurchaseRepo(purchaseId, {
    status: "refunded",
    refunded_at: new Date().toISOString(),
  });
};

export const getPurchase = async (purchaseId) => {
  return await findPurchaseById(purchaseId);
};

export const getPurchasesByOrder = async (orderId) => {
  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      products(*)
    `)
    .eq("razorpay_order_id", orderId)
    .eq("status", "completed");
  
  return { data, error };
};

export const getPurchaseByLicense = async (licenseKey) => {
  return await findPurchaseByLicenseKey(licenseKey);
};

export const getMyPurchases = async (customerId, options = {}) => {
  return await findPurchasesByCustomer(customerId, options);
};

export const getProductPurchases = async (productId, options = {}) => {
  return await findPurchasesByProduct(productId, options);
};

export const getCreatorSales = async (creatorId, options = {}) => {
  return await findPurchasesByCreator(creatorId, options);
};

export const hasPurchased = async (customerId, productId) => {
  const { data, error } = await verifyPurchase(customerId, productId);
  return { hasPurchased: !error && !!data, purchase: data };
};
