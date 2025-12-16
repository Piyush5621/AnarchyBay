import nodemailer from "nodemailer";

// 🔒 Validate required env variables early
if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.error("❌ SMTP configuration missing in environment variables");
  console.error("Required: SMTP_HOST, SMTP_USER, SMTP_PASS");
  process.exit(1);
}

// ✉️ Create transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                        // true only for port 465
  auth: {
    user: process.env.SMTP_USER,        // your Gmail address
    pass: process.env.SMTP_PASS,        // Gmail App Password
  },
});

// 🧪 Verify SMTP connection on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed");
    console.error("Reason:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

