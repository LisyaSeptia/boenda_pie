const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('ADMIN'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('ADMIN'), updateProduct)
  .delete(authorize('ADMIN'), deleteProduct);

module.exports = router;
