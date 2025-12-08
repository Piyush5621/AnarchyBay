import { handleSupabaseError } from "../lib/supabase.js";
import { getProducts, totalProducts } from "../services/product.service.js";

export const getProductsController = async (req, res) => {
    try {
        const { data, error } = await getProducts();
        if (error) {
            return handleSupabaseError(res, error);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getTotalProductsController = async (req, res) => {
    try {
        const { error, count } = await totalProducts();
        if (error) {
            return handleSupabaseError(res, error);
        }
        return res.status(200).json({ count });
    } catch (error) {
        console.log("Error in getTotalProductsController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}