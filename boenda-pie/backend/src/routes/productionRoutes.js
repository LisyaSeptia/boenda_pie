const express = require('express');
const router = express.Router();
const {
  getProductions,
  getProductionById,
  createProduction
} = require('../controllers/productionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.route('/')
  .get(getProductions)
  .post(createProduction);

router.route('/:id')
  .get(getProductionById);

module.exports = router;
