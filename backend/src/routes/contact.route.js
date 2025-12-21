import { Router } from "express";
import { rateLimiters } from "../middleware/rateLimiter.js";
// ✅ Import the controller functions
import * as ContactController from "../controllers/contact.controller.js";
// ✅ Import auth middleware if you want to protect the "View All" route
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// POST /api/contact - Public route for users to send messages
router.post(
  "/", 
  rateLimiters.api, 
  ContactController.submitContactController
);

// GET /api/contact - Admin only route to view messages
// (I added auth middleware here because you don't want the public reading these!)
router.get(
  "/", 
  requireAuth, 
  requireRole("admin"), 
  ContactController.getAllContactMessages
);

export default router;