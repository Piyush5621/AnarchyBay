import { Router } from "express";
import {
  getOverviewController,
  getSalesStatsController,
  getProductStatsController,
  getSalesChartController,
  getTopProductsController,
  getBalanceController,
  getDashboardController,
  getUserAnalyticsController,
  getAdminAnalyticsController,
} from "../controllers/analytics.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";

const router = Router();

router.get("/overview", requireAuth, requireCreator, getOverviewController);
router.get("/sales", requireAuth, requireCreator, getSalesStatsController);
router.get("/chart", requireAuth, requireCreator, getSalesChartController);
router.get("/top-products", requireAuth, requireCreator, getTopProductsController);
router.get("/balance", requireAuth, requireCreator, getBalanceController);
router.get("/dashboard", requireAuth, requireCreator, getDashboardController);
router.get("/user", requireAuth, getUserAnalyticsController);
router.get("/admin", requireAuth, getAdminAnalyticsController);
router.get("/product/:productId", requireAuth, requireCreator, getProductStatsController);

export default router;
