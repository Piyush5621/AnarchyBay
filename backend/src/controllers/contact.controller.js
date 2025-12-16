import { submitContactService } from "../services/contact.service.js";
import { getAllContactMessagesService } from "../services/contact.service.js";
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

export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await getAllContactMessagesService();

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Fetch contact messages error:", error);
    return res.status(500).json({
      message: "Failed to fetch contact messages",
    });
  }
};