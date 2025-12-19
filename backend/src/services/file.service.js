import {
  createFile as createFileRepo,
  updateFile as updateFileRepo,
  deleteFile as deleteFileRepo,
  findFileById,
  findFilesByCreator,
  associateFileWithProduct,
  associateFileWithVariant,
  removeFileAssociation,
  findFilesByProduct,
  findFilesByVariant,
  findProductFilesByFileId,
} from "../repositories/file.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import { findVariantById } from "../repositories/variant.repository.js";
import {
  generateUploadUrl,
  generateDownloadUrl,
  deleteFileFromStorage,
} from "../lib/storage.js";

export const getUploadUrl = async (creatorId, fileName, contentType, fileSize) => {
  const MAX_FILE_SIZE = 500 * 1024 * 1024;

  if (fileSize > MAX_FILE_SIZE) {
    return { error: { message: "File size exceeds limit (500MB)", status: 400 } };
  }

  const { data, error } = await generateUploadUrl(fileName, contentType, creatorId);

  if (error) {
    return { error };
  }

  return { data };
};

export const confirmUpload = async (creatorId, fileData) => {
  const { data, error } = await createFileRepo({
    creator_id: creatorId,
    file_name: fileData.fileName,
    file_path: fileData.path,
    file_size: fileData.fileSize,
    mime_type: fileData.mimeType,
    checksum: fileData.checksum,
  });

  return { data, error };
};

export const updateFile = async (creatorId, fileId, fileData) => {
  const { data: file, error: findError } = await findFileById(fileId);

  if (findError || !file) {
    return { error: { message: "File not found", status: 404 } };
  }

  if (file.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await updateFileRepo(fileId, fileData);
};

export const deleteFile = async (creatorId, fileId) => {
  const { data: file, error: findError } = await findFileById(fileId);

  if (findError || !file) {
    return { error: { message: "File not found", status: 404 } };
  }

  if (file.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  await deleteFileFromStorage(file.file_path);
  return await deleteFileRepo(fileId);
};

export const getFile = async (fileId) => {
  return await findFileById(fileId);
};

export const getMyFiles = async (creatorId) => {
  return await findFilesByCreator(creatorId);
};

export const linkFileToProduct = async (creatorId, productId, fileId) => {
  const { data: product } = await findProductById(productId);

  if (!product || product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  const { data: file } = await findFileById(fileId);

  if (!file || file.creator_id !== creatorId) {
    return { error: { message: "File not found or unauthorized", status: 404 } };
  }

  return await associateFileWithProduct(productId, fileId);
};

export const linkFileToVariant = async (creatorId, variantId, fileId) => {
  const { data: variant } = await findVariantById(variantId);

  if (!variant) {
    return { error: { message: "Variant not found", status: 404 } };
  }

  const { data: product } = await findProductById(variant.product_id);

  if (!product || product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  const { data: file } = await findFileById(fileId);

  if (!file || file.creator_id !== creatorId) {
    return { error: { message: "File not found or unauthorized", status: 404 } };
  }

  return await associateFileWithVariant(variantId, fileId);
};

export const unlinkFileFromProduct = async (creatorId, productId, fileId) => {
  const { data: product } = await findProductById(productId);

  if (!product || product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await removeFileAssociation(productId, fileId);
};

export const getProductFiles = async (productId) => {
  return await findFilesByProduct(productId);
};

export const getVariantFiles = async (variantId) => {
  return await findFilesByVariant(variantId);
};

export const getFileDownloadUrl = async (fileId) => {
  const { data: file, error: findError } = await findFileById(fileId);

  if (findError || !file) {
    return { error: { message: "File not found", status: 404 } };
  }

  const { data, error } = await generateDownloadUrl(file.storage_path);

  if (error) {
    return { error: { message: "Failed to generate download URL", status: 500 } };
  }

  return { 
    data: { 
      signedUrl: data.signedUrl,
      filename: file.original_filename || file.filename,
      contentType: file.content_type,
    } 
  };
};