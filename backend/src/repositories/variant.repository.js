import { supabase } from "../lib/supabase.js";

export const createVariant = async (variantData) => {
  return await supabase
    .from("product_variants")
    .insert(variantData)
    .select()
    .single();
};

export const updateVariant = async (id, variantData) => {
  return await supabase
    .from("product_variants")
    .update({ ...variantData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

export const deleteVariant = async (id) => {
  return await supabase
    .from("product_variants")
    .delete()
    .eq("id", id);
};

export const findVariantById = async (id) => {
  return await supabase
    .from("product_variants")
    .select("*")
    .eq("id", id)
    .single();
};

export const findVariantsByProduct = async (productId) => {
  return await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("name", { ascending: true });
};

export const deactivateVariant = async (id) => {
  return await supabase
    .from("product_variants")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};
