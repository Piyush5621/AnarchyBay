import { Router } from "express";
import multer from "multer";
import {
  createProductController,
  createProductWithFilesController,
  updateProductController,
  deleteProductController,
  getProductController,
  getProductsController,
  getMyProductsController,
  searchProductsController,
  getTotalProductsController,
} from "../controllers/product.controller.js";
import {
  createVariantController,
  updateVariantController,
  deleteVariantController,
  getVariantController,
  getProductVariantsController,
} from "../controllers/variant.controller.js";
import { getProductFilesController } from "../controllers/file.controller.js";
import { requireAuth, requireCreator, optionalAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get("/list", getProductsController);
router.get("/search", searchProductsController);
router.get("/total", getTotalProductsController);
router.get("/featured", (req, res, next) => {
  req.query.featured = "true";
  getProductsController(req, res, next);
});
router.get("/my/list", requireAuth, requireCreator, getMyProductsController);

router.post("/", requireAuth, requireCreator, createProductController);
router.post("/create", requireAuth, requireCreator, upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'preview_images', maxCount: 10 }
]), createProductWithFilesController);

router.get("/variants/:id", getVariantController);
router.post("/:productId/variants", requireAuth, requireCreator, createVariantController);
router.put("/variants/:id", requireAuth, requireCreator, updateVariantController);
router.delete("/variants/:id", requireAuth, requireCreator, deleteVariantController);

router.get("/:productId/variants", getProductVariantsController);
router.get("/:id", optionalAuth, getProductController);
router.get("/:id/files", getProductFilesController);
router.put("/:id", requireAuth, requireCreator, upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'preview_images', maxCount: 10 }
]), updateProductController);
router.delete("/:id", requireAuth, requireCreator, deleteProductController);

// Report a product
router.post("/:id/report", requireAuth, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const productId = req.params.id;
    const reporterId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reported this product
    const { data: existingReport } = await supabase
      .from('product_reports')
      .select('id')
      .eq('product_id', productId)
      .eq('reporter_id', reporterId)
      .eq('status', 'pending')
      .single();

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this product' });
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('product_reports')
      .insert({
        product_id: productId,
        reporter_id: reporterId,
        reason,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) throw reportError;

    return res.json({ 
      message: 'Report submitted successfully. Our team will review it soon.',
      report 
    });
  } catch (error) {
    console.error('Report product error:', error);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
