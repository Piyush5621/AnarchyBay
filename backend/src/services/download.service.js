import { verifyPurchase, findPurchaseById } from "../repositories/purchase.repository.js";
import { findFilesByProduct, findFilesByVariant, findFileById } from "../repositories/file.repository.js";
import { createDownloadLog } from "../repositories/download.repository.js";
import { generateDownloadUrl } from "../lib/storage.js";

export const getDownloadUrl = async (customerId, purchaseId, fileId) => {
  const { data: purchase, error: purchaseError } = await findPurchaseById(purchaseId);

  if (purchaseError || !purchase) {
    return { error: { message: "Purchase not found", status: 404 } };
  }

  if (purchase.customer_id !== customerId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  if (purchase.status !== "completed") {
    return { error: { message: "Purchase not completed", status: 400 } };
  }

  const { data: file, error: fileError } = await findFileById(fileId);

  if (fileError || !file) {
    return { error: { message: "File not found", status: 404 } };
  }

  let productFiles;
  if (purchase.variant_id) {
    const { data } = await findFilesByVariant(purchase.variant_id);
    productFiles = data;
  } else {
    const { data } = await findFilesByProduct(purchase.product_id);
    productFiles = data;
  }

  const isFileLinked = productFiles?.some((pf) => pf.file_id === fileId);

  if (!isFileLinked) {
    return { error: { message: "File not associated with this purchase", status: 403 } };
  }

  const { data: urlData, error: urlError } = await generateDownloadUrl(file.storage_path, 86400);

  if (urlError) {
    return { error: urlError };
  }

  await createDownloadLog({
    purchase_id: purchaseId,
    file_id: fileId,
    ip_address: null,
  });

    return {
      data: {
        downloadUrl: urlData.signedUrl,
        expiresIn: 86400,
        fileName: file.filename,
      },
    };
  };
  
  export const getDownloadUrls = async (customerId, purchaseId) => {
    const { data: purchase, error: purchaseError } = await findPurchaseById(purchaseId);
  
    if (purchaseError || !purchase) {
      return { error: { message: "Purchase not found", status: 404 } };
    }
  
    if (purchase.customer_id !== customerId) {
      return { error: { message: "Unauthorized", status: 403 } };
    }
  
    if (purchase.status !== "completed") {
      return { error: { message: "Purchase not completed", status: 400 } };
    }
  
    let productFiles;
    if (purchase.variant_id) {
      const { data } = await findFilesByVariant(purchase.variant_id);
      productFiles = data;
    } else {
      const { data } = await findFilesByProduct(purchase.product_id);
      productFiles = data;
    }
  
    if (!productFiles || productFiles.length === 0) {
      return { data: { files: [] } };
    }
  
    const downloadLinks = await Promise.all(
        productFiles.map(async (pf) => {
          const file = pf.files;
          const { data: urlData } = await generateDownloadUrl(file.storage_path, 86400);
    
          await createDownloadLog({
            purchase_id: purchaseId,
            file_id: file.id,
            ip_address: null,
          });
    
          return {
            fileId: file.id,
            fileName: file.filename,
            fileSize: file.size,
            downloadUrl: urlData?.signedUrl,
            expiresIn: 86400,
          };
        })
    );

  return { data: { files: downloadLinks } };
};

export const canDownload = async (customerId, productId) => {
  const { data, error } = await verifyPurchase(customerId, productId);
  return { canDownload: !error && !!data && data.status === "completed" };
};
