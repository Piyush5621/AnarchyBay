import { supabase } from "../lib/supabase.js";

export const createFile = async (fileData) => {
  return await supabase
    .from("files")
    .insert(fileData)
    .select()
    .single();
};

export const updateFile = async (id, fileData) => {
  return await supabase
    .from("files")
    .update({ ...fileData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

export const deleteFile = async (id) => {
  return await supabase
    .from("files")
    .delete()
    .eq("id", id);
};

export const findFileById = async (id) => {
  return await supabase
    .from("files")
    .select("*")
    .eq("id", id)
    .single();
};

export const findFilesByCreator = async (creatorId) => {
  return await supabase
    .from("files")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
};

export const associateFileWithProduct = async (productId, fileId) => {
  return await supabase
    .from("product_files")
    .insert({ product_id: productId, file_id: fileId })
    .select()
    .single();
};

export const associateFileWithVariant = async (variantId, fileId) => {
  return await supabase
    .from("product_files")
    .insert({ variant_id: variantId, file_id: fileId })
    .select()
    .single();
};

export const removeFileAssociation = async (productId, fileId) => {
  return await supabase
    .from("product_files")
    .delete()
    .eq("product_id", productId)
    .eq("file_id", fileId);
};

export const findFilesByProduct = async (productId) => {
  return await supabase
    .from("product_files")
    .select("file_id, files(*)")
    .eq("product_id", productId);
};

export const findFilesByVariant = async (variantId) => {
  return await supabase
    .from("product_files")
    .select("file_id, files(*)")
    .eq("variant_id", variantId);
};

export const findProductFilesByFileId = async (fileId) => {
  return await supabase
    .from("product_files")
    .select("*")
    .eq("file_id", fileId);
};
