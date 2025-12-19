import {
  getUploadUrl,
  confirmUpload,
  updateFile,
  deleteFile,
  getFile,
  getMyFiles,
  linkFileToProduct,
  linkFileToVariant,
  unlinkFileFromProduct,
  getProductFiles,
  getFileDownloadUrl,
} from "../services/file.service.js";

export const getUploadUrlController = async (req, res) => {
  try {
    const { fileName, contentType, fileSize } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ error: "fileName and contentType are required" });
    }

    const { data, error } = await getUploadUrl(req.user.id, fileName, contentType, fileSize);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const confirmUploadController = async (req, res) => {
  try {
    const { data, error } = await confirmUpload(req.user.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateFileController = async (req, res) => {
  try {
    const { data, error } = await updateFile(req.user.id, req.params.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteFileController = async (req, res) => {
  try {
    const { error } = await deleteFile(req.user.id, req.params.id);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFileController = async (req, res) => {
  try {
    const { data, error } = await getFile(req.params.id);
    if (error) {
      return res.status(error.status || 404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyFilesController = async (req, res) => {
  try {
    const { data, error } = await getMyFiles(req.user.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const linkFileToProductController = async (req, res) => {
  try {
    const { productId, fileId } = req.body;
    const { data, error } = await linkFileToProduct(req.user.id, productId, fileId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const linkFileToVariantController = async (req, res) => {
  try {
    const { variantId, fileId } = req.body;
    const { data, error } = await linkFileToVariant(req.user.id, variantId, fileId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unlinkFileFromProductController = async (req, res) => {
  try {
    const { productId, fileId } = req.body;
    const { error } = await unlinkFileFromProduct(req.user.id, productId, fileId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "File unlinked successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductFilesController = async (req, res) => {
  try {
    const { data, error } = await getProductFiles(req.params.productId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data?.map(f => f.files) || []);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const downloadFileController = async (req, res) => {
  try {
    const { data, error } = await getFileDownloadUrl(req.user.id, req.params.id);
    if (error) {
      return res.status(error.status || 404).json({ error: error.message });
    }
    
    res.redirect(data.signedUrl);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};