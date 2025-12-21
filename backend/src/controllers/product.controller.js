import {
  createProduct,
  createProductWithFiles,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getMyProducts,
  searchProductsService,
  totalProducts,
} from "../services/product.service.js";

export const createProductController = async (req, res) => {
  try {
    const { data, error } = await createProduct(req.user.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createProductWithFilesController = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      short_description: req.body.short_description || '',
      long_description: req.body.long_description || '',
      price: parseFloat(req.body.price),
      currency: req.body.currency || 'INR',
      category: req.body.category ? JSON.parse(req.body.category) : [],
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      preview_videos: req.body.preview_videos ? JSON.parse(req.body.preview_videos) : [],
      page_color: req.body.page_color || '#ffffff',
    };

    const files = req.files?.files || [];
    const thumbnail = req.files?.thumbnail?.[0];
    const previewImages = req.files?.preview_images || [];

    const { data, error } = await createProductWithFiles(req.user.id, productData, files, thumbnail, previewImages);
    if (error) {
      return res.status(error.status || 400).json({ error: { message: error.message } });
    }
    return res.status(201).json({ product: data });
  } catch (error) {
    console.error('Error creating product with files:', error);
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
};

export const updateProductController = async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, 'with data:', req.body);
    const { data, error } = await updateProduct(req.params.id, req.user.id, req.body);
    if (error) {
      console.error('Update product error:', error);
      return res.status(error.status || 400).json({ error: { message: error.message || 'Failed to update product' } });
    }
    return res.status(200).json({ product: data });
  } catch (error) {
    console.error('Update product exception:', error);
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { data, error } = await deleteProduct(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { data, error } = await getProduct(req.params.id, userId);
    if (error) {
      return res.status(error.status || 404).json({ error: error.message });
    }
    return res.status(200).json({ product: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductsController = async (req, res) => {
  try {
    const sortParam = req.query.sort;
    let sortBy = req.query.sortBy || "created_at";
    let sortOrder = req.query.sortOrder || "desc";

    if (sortParam === "newest") {
      sortBy = "created_at";
      sortOrder = "desc";
    } else if (sortParam === "rating") {
      sortBy = "rating_avg";
      sortOrder = "desc";
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      search: req.query.search,
      sortBy,
      sortOrder,
      featured: req.query.featured === "true" ? true : undefined,
      tags: req.query.tags ? req.query.tags.split(",") : undefined,
    };

    const { data, error, count } = await getProducts(options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({
      products: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyProductsController = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      includeInactive: req.query.includeInactive === "true",
    };

    const { data, error, count } = await getMyProducts(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({
      products: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const searchProductsController = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder || "desc",
    };

    const { data, error, count } = await searchProductsService(q, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({
      products: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTotalProductsController = async (req, res) => {
  try {
    const { error, count } = await totalProducts();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};