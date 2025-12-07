import { handleSupabaseError } from "../lib/supabase.js";
import { uploadFileToStorage, createResourceMetadata, getRecentResources, getResourcesCount, getSellerAnalytics, deleteResource } from "../services/resources.service.js";
import { getCurrentUser } from "../services/auth.service.js";

export const uploadResourceController = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File is required" });

    // try to determine user from bearer token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    let userId = null;
    if (token) {
      const { data, error } = await getCurrentUser(token);
      if (data && data.user) userId = data.user.id;
    }

    const { originalname, mimetype, buffer, size } = file;

    const { data: uploadData, error: uploadError } = await uploadFileToStorage({ fileBuffer: buffer, filename: originalname, contentType: mimetype, userId });

    if (uploadError) return handleSupabaseError(res, uploadError);

    const { data: metaData, error: metaError } = await createResourceMetadata({
      userId,
      title: req.body.title || originalname,
      description: req.body.description || null,
      category: req.body.category || null,
      tags: req.body.tags ? JSON.parse(req.body.tags) : null,
      visibility: req.body.visibility || 'public',
      storagePath: uploadData.path,
      publicUrl: uploadData.publicUrl,
      size,
      mime_type: mimetype,
    });

    if (metaError) return handleSupabaseError(res, metaError);

    return res.status(201).json(metaData?.[0] ?? metaData);
  } catch (error) {
    console.error("Error in uploadResourceController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecentResourcesController = async (req, res) => {
  try {
    const { data, error } = await getRecentResources(5);
    if (error) return handleSupabaseError(res, error);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getResourcesCountController = async (req, res) => {
  try {
    const { count, error } = await getResourcesCount();
    if (error) return handleSupabaseError(res, error);
    return res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSellerAnalyticsController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) return res.status(401).json({ error: "Authorization required" });

    const { data: userRes, error: userErr } = await getCurrentUser(token);
    if (userErr || !userRes?.user) return res.status(401).json({ error: "Invalid token" });

    const userId = userRes.user.id;
    const { data, error } = await getSellerAnalytics(userId);

    if (error) return handleSupabaseError(res, error);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteResourceController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Resource ID required" });

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) return res.status(401).json({ error: "Authorization required" });

    const { data: userRes, error: userErr } = await getCurrentUser(token);
    if (userErr || !userRes?.user) return res.status(401).json({ error: "Invalid token" });

    // Check ownership (optional but recommended)
    const { data, error } = await deleteResource(id);
    if (error) return handleSupabaseError(res, error);

    return res.status(200).json({ message: "Resource deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
