import Razorpay from "razorpay";

let razorpayClient = null;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret && keyId !== 'your_razorpay_key_id_here' && keySecret !== 'your_razorpay_key_secret_here') {
  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} else {
  console.warn("⚠️  Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file with your actual Razorpay API keys");
}

export { razorpayClient };
