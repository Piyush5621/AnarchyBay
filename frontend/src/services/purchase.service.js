import api from "../lib/api/client.js";

export const createRazorpayOrder = async ({ productId, variantId, discountAmount, discountCodeId }) => {
  return await api.post("/api/purchases/checkout/razorpay", {
    productId,
    variantId,
    discountAmount,
    discountCodeId,
  });
};

export const verifyRazorpayPayment = async (paymentData) => {
  return await api.post("/api/purchases/verify/razorpay", paymentData);
};

export const getMyPurchases = async (page = 1, limit = 20) => {
  return await api.get(`/api/purchases/my?page=${page}&limit=${limit}`);
};

export const getPurchase = async (purchaseId) => {
  return await api.get(`/api/purchases/${purchaseId}`);
};

export const getPurchasesByOrder = async (orderId) => {
  return await api.get(`/api/purchases/order/${orderId}`);
};

export const checkPurchase = async (productId) => {
  return await api.get(`/api/purchases/check/${productId}`);
};

export const getDownloadUrls = async (purchaseId) => {
  return await api.get(`/api/downloads/${purchaseId}`);
};