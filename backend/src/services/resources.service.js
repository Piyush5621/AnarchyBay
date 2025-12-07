import { supabase } from "../lib/supabase.js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "resources";

export const uploadFileToStorage = async ({ fileBuffer, filename, contentType, userId }) => {
  try {
    const path = `${userId || 'anon'}/${Date.now()}_${filename}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, fileBuffer, {
      contentType,
      upsert: false,
    });

    if (error) return { error };

    // get public url (works if bucket is public)
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return { data: { path: data.path, publicUrl: publicData?.publicUrl } };
  } catch (err) {
    return { error: err };
  }
};

export const createResourceMetadata = async ({ userId, title, description, category, tags, visibility, storagePath, publicUrl, size, mime_type }) => {
  try {
    const payload = {
      owner_id: userId || null,
      title,
      description,
      category,
      tags,
      visibility,
      storage_path: storagePath,
      public_url: publicUrl,
      size,
      mime_type,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("resources").insert([payload]).select();
    if (error) return { error };
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const getRecentResources = async (limit = 5) => {
  try {
    const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) return { error };
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const getResourcesCount = async () => {
  try {
    const { data, count, error } = await supabase.from("resources").select("id", { count: "exact" });
    if (error) return { error };
    return { count };
  } catch (err) {
    return { error: err };
  }
};

export const getSellerAnalytics = async (userId) => {
  try {
    // Get seller's resources count
    const { count: resourcesCount } = await supabase.from("resources").select("id", { count: "exact" }).eq("owner_id", userId);

    // Try to fetch sales data (if sales table exists; fallback to 0)
    let totalSales = 0;
    let revenue = 0;
    try {
      const salesRes = await supabase.from("sales").select("*").eq("seller_id", userId);
      if (salesRes?.data) {
        totalSales = salesRes.data.length;
        revenue = salesRes.data.reduce((sum, s) => sum + (s.amount || 0), 0);
      }
    } catch (err) {
      // sales table may not exist; use defaults
    }

    return { data: { resources: resourcesCount || 0, totalSales, revenue } };
  } catch (err) {
    return { error: err };
  }
};

export const deleteResource = async (resourceId) => {
  try {
    const { data, error } = await supabase.from("resources").delete().eq("id", resourceId);
    if (error) return { error };
    return { data };
  } catch (err) {
    return { error: err };
  }
};
