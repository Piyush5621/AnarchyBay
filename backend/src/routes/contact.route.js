import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { rateLimiters } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", rateLimiters.api, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message }]);

    if (error) {
      console.error("Contact insert error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact route crash:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
