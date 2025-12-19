import { supabase } from "../lib/supabase.js";

export const createPurchase = async (purchaseData) => {
  const result = await supabase
    .from("purchases")
    .insert(purchaseData)
    .select()
    .single();
  
  if (result.error) {
    console.error("Error creating purchase:", result.error);
    console.error("Data attempted:", purchaseData);
  }
  
  return result;
};

export const updatePurchase = async (id, purchaseData) => {
  return await supabase
    .from("purchases")
    .update(purchaseData)
    .eq("id", id)
    .select()
    .single();
};

export const findPurchaseById = async (id) => {
  return await supabase
    .from("purchases")
    .select(`
      *,
      products(*),
      product_variants(*)
    `)
    .eq("id", id)
    .single();
};

export const findPurchaseByLicenseKey = async (licenseKey) => {
  return await supabase
    .from("purchases")
    .select(`
      *,
      products(*),
      product_variants(*)
    `)
    .eq("license_key", licenseKey)
    .single();
};

export const findPurchasesByCustomer = async (customerId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  return await supabase
    .from("purchases")
    .select(`
      *,
      products(id, name, description, thumbnail_url, creator_id)
    `, { count: "exact" })
    .eq("customer_id", customerId)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .range(offset, offset + limit - 1);
};

export const findPurchasesByProduct = async (productId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  return await supabase
    .from("purchases")
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .range(offset, offset + limit - 1);
};

export const findPurchasesByCreator = async (creatorId, options = {}) => {
  const { page = 1, limit = 20, startDate, endDate } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("purchases")
    .select(`
      *,
      products!inner(id, name, creator_id)
    `, { count: "exact" })
    .eq("products.creator_id", creatorId)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) {
    query = query.gte("purchased_at", startDate);
  }

  if (endDate) {
    query = query.lte("purchased_at", endDate);
  }

  return await query;
};

export const verifyPurchase = async (customerId, productId) => {
  return await supabase
    .from("purchases")
    .select("*")
    .eq("customer_id", customerId)
    .eq("product_id", productId)
    .eq("status", "completed")
    .single();
};

export const findPurchaseByPaymentIntent = async (paymentIntentId) => {
  return await supabase
    .from("purchases")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();
};

export const countPurchasesByCreator = async (creatorId, options = {}) => {
  const { startDate, endDate } = options;

  let query = supabase
    .from("purchases")
    .select("*, products!inner(creator_id)", { count: "exact", head: true })
    .eq("products.creator_id", creatorId)
    .eq("status", "completed");

  if (startDate) {
    query = query.gte("purchased_at", startDate);
  }

  if (endDate) {
    query = query.lte("purchased_at", endDate);
  }

  return await query;
};
