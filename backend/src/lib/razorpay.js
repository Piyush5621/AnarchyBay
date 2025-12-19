import Razorpay from "razorpay";

let razorpayClient = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured. Razorpay features will be disabled.");
}

export { razorpayClient };
