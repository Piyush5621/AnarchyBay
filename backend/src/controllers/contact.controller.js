// ✅ Update the import to match your improved Service
import { submitContactService, getContactMessagesService } from "../services/contact.service.js";

export const submitContactController = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 🔒 Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message are required",
      });
    }

    // 🧠 Call service
    const data = await submitContactService({
      name,
      email,
      subject: subject || null,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data,
    });
  } catch (error) {
    // 🔥 VERY IMPORTANT: log full error
    console.error("Contact Controller Error:", error);

    return res.status(500).json({
      error: error?.message || "Failed to submit message",
    });
  }
};

// ✅ UPGRADED: Now supports Pagination (Page 1, 2, 3...)
export const getAllContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Pass pagination params to the service
    const { data, count } = await getContactMessagesService({ 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    return res.status(200).json({
      success: true,
      data: data || [],
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Fetch contact messages error:", error);
    return res.status(500).json({
      message: "Failed to fetch contact messages",
    });
  }
};