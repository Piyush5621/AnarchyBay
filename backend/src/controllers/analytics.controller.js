import {
  getOverview,
  getSalesStats,
  getProductStats,
  getSalesChart,
  getTopSellingProducts,
  getBalance,
  getDashboardData,
  getUserAnalytics,
  getAdminAnalytics,
} from "../services/analytics.service.js";
import { verifyProductOwnership } from "../services/product.service.js";

export const getOverviewController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getOverview(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSalesStatsController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getSalesStats(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductStatsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { isOwner } = await verifyProductOwnership(productId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getProductStats(productId, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSalesChartController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      groupBy: req.query.groupBy || "day",
    };

    const { data, error } = await getSalesChart(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTopProductsController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 5,
    };

    const { data, error } = await getTopSellingProducts(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBalanceController = async (req, res) => {
  try {
    const { data, error } = await getBalance(req.user.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getDashboardData(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserAnalyticsController = async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getUserAnalytics(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAdminAnalyticsController = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const { data, error } = await getAdminAnalytics(options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
