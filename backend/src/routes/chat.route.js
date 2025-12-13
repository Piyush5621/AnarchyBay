import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Using the working model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Get Data (Digital Products)
    const { data: products } = await supabase
      .from('products')
      .select('name, price, category')
      .eq('is_active', true)
      .limit(8);

    // 2. Format Inventory for AI (Table Format)
    const inventoryList = products && products.length > 0
      ? products.map(p => `| ${p.name} | $${p.price} | ${p.category} |`).join('\n')
      : "No digital products found.";

    // 3. The "Digital Marketplace" System Prompt
    const prompt = `
      SYSTEM IDENTITY:
      You are the AI Assistant for 'Anarchy Bay', a premier digital marketplace (similar to Gumroad).
      Here, creators buy and sell **digital assets**: source code, mini-projects, design templates, and technical skills.

      USER QUESTION: "${message}"

      STRICT OUTPUT RULES:
      
      1. **IF ASKING FOR PRODUCTS:**
         You MUST return the data as a MARKDOWN TABLE.
         
         | Digital Asset | Price | Category |
         | :--- | :--- | :--- |
         | React Dashboard | $20 | Code |
         
         Real Data to use:
         ${inventoryList}
         
         (If empty, say "No digital assets listed right now.")

      2. **IF ASKING "HOW TO USE" or "STEPS":**
         Provide this exact guide for digital trading:
         **How to use Anarchy Bay:**
         1. 🚀 **Sign Up** as a Creator or Buyer.
         2. 📂 **List** your code, project, or skill.
         3. 💳 **Buy** securely using our platform.
         4. ⬇️ **Instant Download** of assets after purchase.

      3. **IF ASKING "WHAT IS THIS?":**
         "Anarchy Bay is a digital marketplace where developers and creators sell source code, mini-projects, and skills directly to buyers. No physical shipping—just instant digital delivery."

      4. **IF GREETING ("Hi", "Hello"):**
         "👋 Welcome to Anarchy Bay! I can help you find **source code**, **projects**, or help you **start selling** digital goods."

      5. **TONE:** Tech-savvy, professional, encouraging.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "⚠️ Connection error. Please try again." });
  }
});

export default router;