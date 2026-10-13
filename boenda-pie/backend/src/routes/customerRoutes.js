const express = require('express');
const router = express.Router();
const {
  getCustomers,
  createOrGetCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createOrGetCustomer);

module.exports = router;
