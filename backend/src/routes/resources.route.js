import express from "express";
import multer from "multer";
import {
  uploadResourceController,
  getRecentResourcesController,
  getResourcesCountController,
  getSellerAnalyticsController,
  deleteResourceController,
} from "../controllers/resources.controller.js";

const router = express.Router();

// use memory storage and forward buffer to supabase
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/upload", upload.single("file"), uploadResourceController);
router.get("/recent", getRecentResourcesController);
router.get("/count", getResourcesCountController);
router.get("/analytics", getSellerAnalyticsController);
router.delete("/:id", deleteResourceController);

export default router;
