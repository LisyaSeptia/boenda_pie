const express = require('express');
const router = express.Router();
const {
  getStockMovements,
  getStockSummary,
  adjustStock
} = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/movements', getStockMovements);
router.get('/summary', getStockSummary);
router.post('/adjust', adjustStock);

module.exports = router;
