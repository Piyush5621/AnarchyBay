import {
  createPurchase,
  completePurchase,
  getPurchase,
  getMyPurchases,
  getCreatorSales,
  hasPurchased,
  getPurchasesByOrder,
} from "../services/purchase.service.js";
import { validateDiscount, useDiscount } from "../services/discount.service.js";
import { findProductById } from "../repositories/product.repository.js";

export const initiatePurchaseController = async (req, res) => {
  try {
    const { productId, variantId, discountCode } = req.body;

    const { data: product, error: productError } = await findProductById(productId);
    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let discountAmount = 0;
    let discountCodeId = null;

    if (discountCode) {
      const validation = await validateDiscount(discountCode, productId, parseFloat(product.price));
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error.message });
      }
      discountAmount = validation.discount.discountAmount;
      discountCodeId = validation.discount.id;
    }

    const { data, error } = await createPurchase({
      customer_id: req.user.id,
      product_id: productId,
      variant_id: variantId,
      payment_provider: "stripe",
      discount_code_id: discountCodeId,
      discount_amount: discountAmount,
      status: "pending",
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const completePurchaseController = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const { data: existing } = await getPurchase(purchaseId);
    if (!existing || existing.customer_id !== req.user.id) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    if (existing.discount_code_id) {
      await useDiscount(existing.discount_code_id);
    }

    const { data, error } = await completePurchase(purchaseId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPurchaseController = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await getPurchase(id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const getPurchasesByOrderController = async (req, res) => {
  const { orderId } = req.params;
  const { data, error } = await getPurchasesByOrder(orderId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const getMyPurchasesController = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const { data, error, count } = await getMyPurchases(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      purchases: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCreatorSalesController = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error, count } = await getCreatorSales(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      sales: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkPurchaseController = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await hasPurchased(req.user.id, productId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
