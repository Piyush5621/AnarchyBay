import {
  createProduct as createProductRepo,
  updateProduct as updateProductRepo,
  softDeleteProduct,
  findProductById,
  findProductsByCreator,
  findAllProducts,
  searchProducts,
  countProductsByCreator,
} from "../repositories/product.repository.js";
import { findVariantsByProduct } from "../repositories/variant.repository.js";
import { findFilesByProduct } from "../repositories/file.repository.js";
import { supabase } from "../lib/supabase.js";
import { v4 as uuidv4 } from "uuid";

export const createProduct = async (creatorId, productData) => {
  return await createProductRepo({
    ...productData,
    creator_id: creatorId,
    is_active: true,
    is_featured: productData.is_featured || false,
  });
};

export const createProductWithFiles = async (creatorId, productData, files, thumbnail, previewImages = []) => {
  try {
    let thumbnailUrl = null;
    let previewImageUrls = [];

    if (thumbnail) {
      const thumbnailPath = `thumbnails/${creatorId}/${uuidv4()}-${thumbnail.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from('product-files')
        .upload(thumbnailPath, thumbnail.buffer, {
          contentType: thumbnail.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('product-files')
          .getPublicUrl(thumbnailPath);
        thumbnailUrl = urlData.publicUrl;
      }
    }

    for (const img of previewImages) {
      const imgPath = `previews/${creatorId}/${uuidv4()}-${img.originalname}`;
      const { error: imgUploadError } = await supabase.storage
        .from('product-files')
        .upload(imgPath, img.buffer, {
          contentType: img.mimetype,
          upsert: false,
        });

      if (!imgUploadError) {
        const { data: urlData } = supabase.storage
          .from('product-files')
          .getPublicUrl(imgPath);
        previewImageUrls.push(urlData.publicUrl);
      }
    }

    const { data: product, error: productError } = await createProductRepo({
      name: productData.name,
      description: productData.description,
      short_description: productData.short_description,
      long_description: productData.long_description,
      price: productData.price,
      currency: productData.currency,
      category: productData.category,
      tags: productData.tags,
      creator_id: creatorId,
      is_active: true,
      is_featured: false,
      thumbnail_url: thumbnailUrl,
      preview_images: previewImageUrls,
      preview_videos: productData.preview_videos || [],
      page_color: productData.page_color || '#ffffff',
    });

    if (productError) {
      return { error: { message: productError.message || 'Failed to create product' } };
    }

    for (const file of files) {
      const filePath = `products/${creatorId}/${product.id}/${uuidv4()}-${file.originalname}`;
      const { error: fileUploadError } = await supabase.storage
        .from('product-files')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (fileUploadError) {
        console.error('File upload error:', fileUploadError);
        continue;
      }

      const { error: fileRecordError } = await supabase
        .from('files')
        .insert({
          id: uuidv4(),
          creator_id: creatorId,
          filename: file.originalname,
          original_filename: file.originalname,
          size: file.size,
          content_type: file.mimetype,
          storage_path: filePath,
          storage_bucket: 'product-files',
        });

      if (!fileRecordError) {
        const { data: fileData } = await supabase
          .from('files')
          .select('id')
          .eq('storage_path', filePath)
          .single();

        if (fileData) {
          await supabase
            .from('product_files')
            .insert({
              product_id: product.id,
              file_id: fileData.id,
            });
        }
      }
    }

    return { data: product };
  } catch (error) {
    console.error('Create product with files error:', error);
    return { error: { message: error.message || 'Failed to create product' } };
  }
};

export const updateProduct = async (productId, creatorId, productData) => {
  const { data: existing, error: findError } = await findProductById(productId);

  if (findError || !existing) {
    return { error: { message: "Product not found", status: 404 } };
  }

  if (existing.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await updateProductRepo(productId, productData);
};

export const deleteProduct = async (productId, creatorId) => {
  const { data: existing, error: findError } = await findProductById(productId);

  if (findError || !existing) {
    return { error: { message: "Product not found", status: 404 } };
  }

  if (existing.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await softDeleteProduct(productId);
};

export const getProduct = async (productId, userId = null) => {
  const { data: product, error } = await findProductById(productId);

  if (error || !product) {
    return { error: { message: "Product not found", status: 404 } };
  }

  const { data: variants } = await findVariantsByProduct(productId);
  const { data: files } = await findFilesByProduct(productId);

  let isPurchased = false;
  if (userId) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("customer_id", userId)
      .eq("product_id", productId)
      .eq("status", "completed")
      .maybeSingle();
    
    if (purchase) isPurchased = true;
  }

  return {
    data: {
      ...product,
      variants: variants || [],
      files: files?.map((f) => f.files) || [],
      isPurchased
    },
  };
};

export const getProducts = async (options = {}) => {
  return await findAllProducts(options);
};

export const getMyProducts = async (creatorId, options = {}) => {
  return await findProductsByCreator(creatorId, options);
};

export const searchProductsService = async (query, options = {}) => {
  return await searchProducts(query, options);
};

export const totalProducts = async () => {
  const { count, error } = await findAllProducts({ limit: 1 });
  return { count, error };
};

export const countMyProducts = async (creatorId) => {
  return await countProductsByCreator(creatorId);
};

export const verifyProductOwnership = async (productId, creatorId) => {
  const { data: product, error } = await findProductById(productId);

  if (error || !product) {
    return { isOwner: false, error: { message: "Product not found" } };
  }

  return { isOwner: product.creator_id === creatorId };
};