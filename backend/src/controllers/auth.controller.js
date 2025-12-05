// CLIENTS
import { handleSupabaseError } from "../lib/supabase.js"
// SERVICES
import { signUp, login, getCurrentUser } from "../services/auth.service.js";

export const signUpController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await signUp({email, password});

    if (error) {
      return handleSupabaseError(res, error);
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("Error in signUp controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await login({email, password});

    if (error) {
      return handleSupabaseError(res, error);
    }

    return res.status(200).json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in login controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUserController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const { data, error } = await getCurrentUser(token);

    if (error) {
      return handleSupabaseError(res, error);
    }

    return res.status(200).json(data.user);
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutController = async (req, res) => {
  try {
    // client side anyways (dummy implementation)
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


