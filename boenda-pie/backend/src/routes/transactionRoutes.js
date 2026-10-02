const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransactionById);

module.exports = router;
