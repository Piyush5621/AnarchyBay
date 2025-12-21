import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import * as AdminController from "../controllers/admin.controller.js"; // Import everything

const router = Router();

// Stats
router.get("/stats", requireAuth, requireRole('admin'), AdminController.getStats);

// Users
router.get("/users", requireAuth, requireRole('admin'), AdminController.getUsers);
router.put("/users/:id/role", requireAuth, requireRole('admin'), AdminController.updateUserRole);

// Products
router.get("/products", requireAuth, requireRole('admin'), AdminController.getProducts);
router.put("/products/:id/featured", requireAuth, requireRole('admin'), AdminController.toggleProductFeatured);
router.delete("/products/:id", requireAuth, requireRole('admin'), AdminController.deactivateProduct);
router.put("/products/:id/activate", requireAuth, requireRole('admin'), AdminController.activateProduct);

// Contact
router.get("/contact-messages", requireAuth, requireRole("admin"), AdminController.getContactMessages);
router.post("/contact-messages/:id/reply", requireAuth, requireRole("admin"), AdminController.replyToContactMessage);

export default router;