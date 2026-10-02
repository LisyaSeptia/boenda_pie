const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getSalesReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardData);
router.get('/sales', getSalesReport);

module.exports = router;
