import { submitContactService } from '../services/contact.service.js';

export const submitContactController = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email and message are required',
      });
    }

    const result = await submitContactService({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: 'Message submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to submit message',
    });
  }
};
