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
import { requireAuth, requireCreator } from "../middleware/auth.js";

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
router.get("/:id", getProductController);
router.get("/:id/files", getProductFilesController);
router.put("/:id", requireAuth, requireCreator, updateProductController);
router.delete("/:id", requireAuth, requireCreator, deleteProductController);

export default router;