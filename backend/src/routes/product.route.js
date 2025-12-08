import { Router } from 'express';
import { getProductsController, getTotalProductsController } from '../controllers/product.controller.js';

const router = Router();

// GET /products - Retrieve all products
router.get('/list', getProductsController);
router.get('/total', getTotalProductsController);

export default router;